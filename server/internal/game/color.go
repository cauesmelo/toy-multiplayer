package game

import (
	"log"
	"sync"
)

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

// NewColorManager creates a new ColorManager
func NewColorManager() *ColorManager {
	cm := &ColorManager{
		available: make([]string, len(playerColors)),
		assigned:  make(map[string]string),
	}
	copy(cm.available, playerColors)
	return cm
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

