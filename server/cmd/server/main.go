package main

import (
	"log"
	"net/http"

	"github.com/cauesmelo/toy-multiplayer/server/internal/network"
)

func main() {
	http.HandleFunc("/ws", network.HandleWebSocket)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	port := ":8080"
	log.Printf("🎮 Game Server")
	log.Printf("Starting server on port %s", port)
	log.Printf("WebSocket: ws://localhost%s/ws", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Server error: ", err)
	}
}
