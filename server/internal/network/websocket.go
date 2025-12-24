package network

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/cauesmelo/toy-multiplayer/server/internal/game"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Message types
const (
	MsgTypeJoin     = "join"
	MsgTypeError    = "error"
	MsgTypePosition = "position"
	MsgTypeState    = "state"
	MsgTypeFire     = "fire"
)

// Message represents a WebSocket message
type Message struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

// JoinPayload represents a join request
type JoinPayload struct {
	Name string `json:"name"`
}

// JoinResponse represents a join response
type JoinResponse struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

// ErrorPayload represents an error message
type ErrorPayload struct {
	Message string `json:"message"`
}

var gameServer *game.Server

func init() {
	gameServer = game.NewServer()
	gameServer.Start()
}

// HandleWebSocket handles WebSocket connections
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	log.Println("Client connected, waiting for join message...")

	// Wait for join message
	var msg Message
	if err := conn.ReadJSON(&msg); err != nil {
		log.Printf("Error reading message: %v", err)
		return
	}

	if msg.Type != MsgTypeJoin {
		sendError(conn, "First message must be a join request")
		return
	}

	// Parse join payload
	payloadBytes, err := json.Marshal(msg.Payload)
	if err != nil {
		sendError(conn, "Invalid join payload")
		return
	}

	var joinPayload JoinPayload
	if err := json.Unmarshal(payloadBytes, &joinPayload); err != nil {
		sendError(conn, "Invalid join payload format")
		return
	}

	// Validate name
	if joinPayload.Name == "" || len(joinPayload.Name) > 10 {
		sendError(conn, "Name must be between 1 and 10 characters")
		return
	}

	// Assign color to player
	colorManager := gameServer.GetColorManager()
	playerColor := colorManager.AssignColor(joinPayload.Name)

	// Random spawn position
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	spawnX := float64(rng.Intn(3000) + 100) // Random X between 100 and 3100
	spawnY := 100.0                         // Spawn from sky

	// Create player
	player := &game.Player{
		Name:      joinPayload.Name,
		Color:     playerColor,
		Conn:      conn,
		Connected: true,
		Position: game.PositionPayload{
			X:      spawnX,
			Y:      spawnY,
			Health: 3,
		},
	}

	// Add to game server
	gameServer.AddPlayer(player)

	// Send join confirmation with color
	joinResponse := Message{
		Type: "joined",
		Payload: JoinResponse{
			Name:  joinPayload.Name,
			Color: playerColor,
		},
	}
	if err := conn.WriteJSON(joinResponse); err != nil {
		log.Printf("Error sending join response: %v", err)
		colorManager.ReleaseColor(joinPayload.Name)
		gameServer.RemovePlayer(joinPayload.Name)
		return
	}

	log.Printf("Player joined: %s (color: %s)", joinPayload.Name, playerColor)

	// Send initial game state
	gameServer.BroadcastGameState()

	// Keep connection alive and handle messages
	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
			// Mark as disconnected immediately
			player.ConnectedMu.Lock()
			player.Connected = false
			player.ConnectedMu.Unlock()

			// Cleanup on disconnect
			gameServer.RemovePlayer(joinPayload.Name)
			colorManager.ReleaseColor(joinPayload.Name)

			// Broadcast updated state
			gameServer.BroadcastGameState()

			// Check if it's a clean disconnect
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				log.Printf("Player %s disconnected cleanly", joinPayload.Name)
			} else {
				log.Printf("Player %s disconnected: %v", joinPayload.Name, err)
			}
			break
		}

		// Handle different message types
		switch msg.Type {
		case MsgTypePosition:
			// Parse position update
			posBytes, err := json.Marshal(msg.Payload)
			if err != nil {
				continue
			}

			var posPayload game.PositionPayload
			if err := json.Unmarshal(posBytes, &posPayload); err != nil {
				continue
			}

			// Update player position
			gameServer.UpdatePlayerPosition(joinPayload.Name, posPayload)

		case MsgTypeFire:
			// Parse fire message
			fireBytes, err := json.Marshal(msg.Payload)
			if err != nil {
				continue
			}

			var firePayload game.FirePayload
			if err := json.Unmarshal(fireBytes, &firePayload); err != nil {
				continue
			}

			// Create bullet
			bulletID := gameServer.AddBullet(
				joinPayload.Name,
				firePayload.X,
				firePayload.Y,
				firePayload.Direction,
			)
			log.Printf("🔫 %s fired bullet %s at (%.0f, %.0f)", joinPayload.Name, bulletID, firePayload.X, firePayload.Y)

		default:
			log.Printf("Unknown message type from %s: %s", joinPayload.Name, msg.Type)
		}
	}
}

func sendError(conn *websocket.Conn, message string) {
	msg := Message{
		Type: MsgTypeError,
		Payload: ErrorPayload{
			Message: message,
		},
	}
	conn.WriteJSON(msg)
}
