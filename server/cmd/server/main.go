package main

import (
	"log"
	"net/http"
	"os"

	"github.com/cauesmelo/toy-multiplayer/server/internal/network"
)

func main() {
	// WebSocket endpoint
	http.HandleFunc("/ws", network.HandleWebSocket)

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Serve static files from ./dist directory
	http.Handle("/", http.FileServer(http.Dir("./dist")))

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	log.Printf("🎮 Game Server")
	log.Printf("Starting server on port %s", port)
	log.Printf("WebSocket: ws://localhost:%s/ws", port)
	log.Printf("HTTP: http://localhost:%s", port)
	log.Printf("Serving static files from: ./dist")

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("Server error: ", err)
	}
}
