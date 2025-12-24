package network

import (
	"encoding/json"
	"log"
	"net/http"

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

	log.Printf("Player joined: %s", joinPayload.Name)

	// Keep connection alive and handle messages
	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
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
