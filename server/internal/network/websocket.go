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
	MsgTypeJoin     = "join"
	MsgTypeError    = "error"
	MsgTypePosition = "position"
	MsgTypeState    = "state"
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

type PositionPayload struct {
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	VelX     float64 `json:"velX"`
	VelY     float64 `json:"velY"`
	Facing   int     `json:"facing"`
	OnGround bool    `json:"onGround"`
}

type PlayerState struct {
	Name     string  `json:"name"`
	Color    string  `json:"color"`
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	VelX     float64 `json:"velX"`
	VelY     float64 `json:"velY"`
	Facing   int     `json:"facing"`
	OnGround bool    `json:"onGround"`
}

type GameStatePayload struct {
	Players []PlayerState `json:"players"`
}

// Player represents a connected player
type Player struct {
	Name        string
	Color       string
	Conn        *websocket.Conn
	Position    PositionPayload
	Connected   bool
	mu          sync.Mutex
	connectedMu sync.RWMutex
}

// GameServer manages all connected players and game state
type GameServer struct {
	players map[string]*Player
	mu      sync.RWMutex
}

var gameServer = &GameServer{
	players: make(map[string]*Player),
}

// AddPlayer adds a player to the game
func (gs *GameServer) AddPlayer(player *Player) {
	gs.mu.Lock()
	defer gs.mu.Unlock()
	gs.players[player.Name] = player
	log.Printf("Player %s added to game server (total: %d)", player.Name, len(gs.players))
}

// RemovePlayer removes a player from the game
func (gs *GameServer) RemovePlayer(name string) {
	gs.mu.Lock()
	defer gs.mu.Unlock()
	delete(gs.players, name)
	log.Printf("Player %s removed from game server (total: %d)", name, len(gs.players))
}

// UpdatePlayerPosition updates a player's position
func (gs *GameServer) UpdatePlayerPosition(name string, pos PositionPayload) {
	gs.mu.RLock()
	player, exists := gs.players[name]
	gs.mu.RUnlock()

	if exists {
		player.mu.Lock()
		player.Position = pos
		player.mu.Unlock()
	}
}

// BroadcastGameState sends current game state to all players
func (gs *GameServer) BroadcastGameState() {
	gs.mu.RLock()
	defer gs.mu.RUnlock()

	// Build game state - only include connected players
	players := make([]PlayerState, 0, len(gs.players))
	for _, player := range gs.players {
		player.connectedMu.RLock()
		isConnected := player.Connected
		player.connectedMu.RUnlock()

		if !isConnected {
			continue
		}

		player.mu.Lock()
		players = append(players, PlayerState{
			Name:     player.Name,
			Color:    player.Color,
			X:        player.Position.X,
			Y:        player.Position.Y,
			VelX:     player.Position.VelX,
			VelY:     player.Position.VelY,
			Facing:   player.Position.Facing,
			OnGround: player.Position.OnGround,
		})
		player.mu.Unlock()
	}

	stateMsg := Message{
		Type: MsgTypeState,
		Payload: GameStatePayload{
			Players: players,
		},
	}

	// Send to all connected players
	for _, player := range gs.players {
		player.connectedMu.RLock()
		isConnected := player.Connected
		player.connectedMu.RUnlock()

		if !isConnected {
			continue
		}

		if err := player.Conn.WriteJSON(stateMsg); err != nil {
			// Mark as disconnected on write error
			player.connectedMu.Lock()
			player.Connected = false
			player.connectedMu.Unlock()
		}
	}
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

	// Create player
	player := &Player{
		Name:      joinPayload.Name,
		Color:     playerColor,
		Conn:      conn,
		Connected: true,
		Position: PositionPayload{
			X: 100,
			Y: 1600,
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
			player.connectedMu.Lock()
			player.Connected = false
			player.connectedMu.Unlock()

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

			var posPayload PositionPayload
			if err := json.Unmarshal(posBytes, &posPayload); err != nil {
				continue
			}

			// Update player position
			gameServer.UpdatePlayerPosition(joinPayload.Name, posPayload)

			// Broadcast updated state to all players
			gameServer.BroadcastGameState()

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
