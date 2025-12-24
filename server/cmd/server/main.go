package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"

	"github.com/cauesmelo/toy-multiplayer/server/internal/network"
)

//go:embed all:static
var staticFiles embed.FS

func main() {
	// WebSocket endpoint
	http.HandleFunc("/ws", network.HandleWebSocket)

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Serve static files
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal("Failed to load static files: ", err)
	}
	
	fileServer := http.FileServer(http.FS(staticFS))
	http.Handle("/", fileServer)

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
	
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("Server error: ", err)
	}
}
