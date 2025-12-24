package game

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Bullet represents a bullet in the game
type Bullet struct {
	ID        string
	OwnerName string
	X         float64
	Y         float64
	VelX      float64
	VelY      float64
	Direction int
	CreatedAt float64
	Mu        sync.Mutex
}

// Player represents a connected player
type Player struct {
	Name        string
	Color       string
	Conn        *websocket.Conn
	Position    PositionPayload
	Connected   bool
	KillCount   int
	LastHitBy   string
	Mu          sync.Mutex
	ConnectedMu sync.RWMutex
}

// Server manages all connected players and game state
type Server struct {
	players      map[string]*Player
	bullets      map[string]*Bullet
	bulletCount  int
	colorManager *ColorManager
	mu           sync.RWMutex
}

// NewServer creates a new game server
func NewServer() *Server {
	return &Server{
		players:      make(map[string]*Player),
		bullets:      make(map[string]*Bullet),
		colorManager: NewColorManager(),
	}
}

// Start starts the game loop
func (gs *Server) Start() {
	go gs.gameLoop()
}

// gameLoop runs the server game loop at 60 FPS
func (gs *Server) gameLoop() {
	ticker := time.NewTicker(time.Second / 60)
	defer ticker.Stop()

	lastTime := time.Now()

	for range ticker.C {
		now := time.Now()
		dt := now.Sub(lastTime).Seconds()
		lastTime = now

		// Update bullets and check collisions
		gs.UpdateBullets(dt)

		// Broadcast state to all clients
		gs.BroadcastGameState()
	}
}

// AddPlayer adds a player to the game
func (gs *Server) AddPlayer(player *Player) {
	gs.mu.Lock()
	defer gs.mu.Unlock()
	gs.players[player.Name] = player
	log.Printf("Player %s added to game server (total: %d)", player.Name, len(gs.players))
}

// RemovePlayer removes a player from the game
func (gs *Server) RemovePlayer(name string) {
	gs.mu.Lock()
	defer gs.mu.Unlock()
	delete(gs.players, name)
	log.Printf("Player %s removed from game server (total: %d)", name, len(gs.players))
}

// GetColorManager returns the color manager
func (gs *Server) GetColorManager() *ColorManager {
	return gs.colorManager
}

// UpdatePlayerPosition updates a player's position
func (gs *Server) UpdatePlayerPosition(name string, pos PositionPayload) {
	gs.mu.RLock()
	player, exists := gs.players[name]
	gs.mu.RUnlock()

	if exists {
		player.Mu.Lock()
		// Update position but preserve server-authoritative health
		currentHealth := player.Position.Health
		player.Position = pos
		player.Position.Health = currentHealth

		// Check if player fell off the map (death zone)
		if player.Position.Y > 1800 {
			player.Position.Health--
			log.Printf("💀 %s fell off the map (health: %d)", player.Name, player.Position.Health)

			if player.Position.Health <= 0 {
				// Respawn player
				gs.mu.Lock()
				player.Position.X = float64(100 + (gs.bulletCount*200)%3000)
				player.Position.Y = 100
				player.Position.VelX = 0
				player.Position.VelY = 0
				player.Position.Health = 3
				gs.mu.Unlock()
				log.Printf("🔄 %s respawned at (%.0f, %.0f)", player.Name, player.Position.X, player.Position.Y)
			} else {
				// Just respawn at a safe location but keep health
				player.Position.X = float64(100 + (player.Position.Health*500)%3000)
				player.Position.Y = 1600
				player.Position.VelX = 0
				player.Position.VelY = 0
			}
		}
		player.Mu.Unlock()
	}
}

// AddBullet adds a bullet to the game
func (gs *Server) AddBullet(ownerName string, x, y float64, direction int) string {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	gs.bulletCount++
	bulletID := fmt.Sprintf("%s_%d", ownerName, gs.bulletCount)

	bullet := &Bullet{
		ID:        bulletID,
		OwnerName: ownerName,
		X:         x,
		Y:         y,
		VelX:      float64(direction) * 600, // 600 pixels per second
		VelY:      0,
		Direction: direction,
		CreatedAt: float64(time.Now().UnixMilli()) / 1000.0,
	}

	gs.bullets[bulletID] = bullet
	return bulletID
}

// UpdateBullets updates all bullet positions and handles collisions
func (gs *Server) UpdateBullets(dt float64) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	currentTime := float64(time.Now().UnixMilli()) / 1000.0
	bulletsToRemove := []string{}

	// Update bullet positions
	for id, bullet := range gs.bullets {
		bullet.Mu.Lock()
		bullet.X += bullet.VelX * dt
		age := currentTime - bullet.CreatedAt
		bullet.Mu.Unlock()

		// Remove bullets older than 2 seconds or out of bounds
		if age > 2.0 || bullet.X < 0 || bullet.X > 3200 {
			bulletsToRemove = append(bulletsToRemove, id)
			continue
		}

		// Check collision with players
		for _, player := range gs.players {
			if player.Name == bullet.OwnerName {
				continue // Can't hit yourself
			}

			player.ConnectedMu.RLock()
			connected := player.Connected
			player.ConnectedMu.RUnlock()

			if !connected {
				continue
			}

			player.Mu.Lock()
			// Simple AABB collision (bullet vs player)
			bulletWidth := 8.0
			bulletHeight := 4.0
			playerWidth := 32.0
			playerHeight := 48.0

			if bullet.X < player.Position.X+playerWidth &&
				bullet.X+bulletWidth > player.Position.X &&
				bullet.Y < player.Position.Y+playerHeight &&
				bullet.Y+bulletHeight > player.Position.Y {

				// Hit!
				player.Position.Health--
				player.LastHitBy = bullet.OwnerName

				if player.Position.Health <= 0 {
					// Player died - award kill
					if killer, exists := gs.players[bullet.OwnerName]; exists {
						killer.Mu.Lock()
						killer.KillCount++
						killer.Mu.Unlock()
						log.Printf("💀 %s killed %s (kills: %d)", bullet.OwnerName, player.Name, killer.KillCount)
					}

					// Respawn player
					player.Position.X = float64(100 + (gs.bulletCount*200)%3000)
					player.Position.Y = 100 // Spawn at top (will fall)
					player.Position.VelX = 0
					player.Position.VelY = 0
					player.Position.Health = 3
					player.LastHitBy = ""
					log.Printf("🔄 %s respawned at (%.0f, %.0f)", player.Name, player.Position.X, player.Position.Y)
				} else {
					log.Printf("💥 %s hit %s (health: %d)", bullet.OwnerName, player.Name, player.Position.Health)
				}

				player.Mu.Unlock()
				bulletsToRemove = append(bulletsToRemove, id)
				break
			}
			player.Mu.Unlock()
		}
	}

	// Remove expired bullets
	for _, id := range bulletsToRemove {
		delete(gs.bullets, id)
	}
}

// BroadcastGameState sends current game state to all players
func (gs *Server) BroadcastGameState() {
	gs.mu.RLock()
	defer gs.mu.RUnlock()

	// Build game state - only include connected players
	players := make([]PlayerState, 0, len(gs.players))
	for _, player := range gs.players {
		player.ConnectedMu.RLock()
		isConnected := player.Connected
		player.ConnectedMu.RUnlock()

		if !isConnected {
			continue
		}

		player.Mu.Lock()
		players = append(players, PlayerState{
			Name:      player.Name,
			Color:     player.Color,
			X:         player.Position.X,
			Y:         player.Position.Y,
			VelX:      player.Position.VelX,
			VelY:      player.Position.VelY,
			Facing:    player.Position.Facing,
			OnGround:  player.Position.OnGround,
			Health:    player.Position.Health,
			KillCount: player.KillCount,
		})
		player.Mu.Unlock()
	}

	// Build bullet state
	bullets := make([]BulletState, 0, len(gs.bullets))
	for _, bullet := range gs.bullets {
		bullet.Mu.Lock()
		bullets = append(bullets, BulletState{
			ID:        bullet.ID,
			OwnerName: bullet.OwnerName,
			X:         bullet.X,
			Y:         bullet.Y,
			Direction: bullet.Direction,
		})
		bullet.Mu.Unlock()
	}

	gameState := GameStatePayload{
		Players: players,
		Bullets: bullets,
	}

	// Send to all connected players
	for _, player := range gs.players {
		player.ConnectedMu.RLock()
		isConnected := player.Connected
		player.ConnectedMu.RUnlock()

		if !isConnected {
			continue
		}

		// Send using a Message wrapper (defined in network package)
		if err := player.Conn.WriteJSON(map[string]interface{}{
			"type":    "state",
			"payload": gameState,
		}); err != nil {
			// Mark as disconnected on write error
			player.ConnectedMu.Lock()
			player.Connected = false
			player.ConnectedMu.Unlock()
		}
	}
}
