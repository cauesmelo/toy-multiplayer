package network

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var allowedOrigins = []string{
	"http://localhost:5173",
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Player colors - 8 distinct colors
var playerColors = []string{
	"#FF6B6B", // Red
	"#4ECDC4", // Cyan
	"#45B7D1", // Blue
	"#FFA07A", // Orange
	"#98D8C8", // Mint
	"#F7DC6F", // Yellow
	"#BB8FCE", // Purple
	"#85C1E2", // Sky Blue
}

// ColorManager manages color assignment to players
type ColorManager struct {
	mu        sync.Mutex
	available []string
	assigned  map[string]string // playerName -> color
}

var colorManager = &ColorManager{
	available: make([]string, len(playerColors)),
	assigned:  make(map[string]string),
}

func init() {
	copy(colorManager.available, playerColors)
}

// AssignColor assigns a color to a player
func (cm *ColorManager) AssignColor(playerName string) string {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	var color string
	if len(cm.available) > 0 {
		// Take first available color
		color = cm.available[0]
		cm.available = cm.available[1:]
	} else {
		// All colors in use, reuse the first one
		color = playerColors[0]
	}

	cm.assigned[playerName] = color
	log.Printf("Assigned color %s to %s (available: %d)", color, playerName, len(cm.available))
	return color
}

// ReleaseColor returns a color back to the pool
func (cm *ColorManager) ReleaseColor(playerName string) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	if color, exists := cm.assigned[playerName]; exists {
		delete(cm.assigned, playerName)
		cm.available = append(cm.available, color)
		log.Printf("Released color %s from %s (available: %d)", color, playerName, len(cm.available))
	}
}

// Message types
const (
	MsgTypeJoin  = "join"
	MsgTypeError = "error"
)

type Message struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type JoinPayload struct {
	Name string `json:"name"`
}

type JoinResponse struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type ErrorPayload struct {
	Message string `json:"message"`
}

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
	playerColor := colorManager.AssignColor(joinPayload.Name)

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
		return
	}

	log.Printf("Player joined: %s (color: %s)", joinPayload.Name, playerColor)

	// Keep connection alive and handle messages
	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
			// Release color when player disconnects
			colorManager.ReleaseColor(joinPayload.Name)

			// Check if it's a clean disconnect
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				log.Printf("Player %s disconnected cleanly", joinPayload.Name)
			} else {
				log.Printf("Player %s disconnected: %v", joinPayload.Name, err)
			}
			break
		}

		log.Printf("Message from %s: %s", joinPayload.Name, msg.Type)
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
