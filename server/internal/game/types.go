package game

// PositionPayload represents a player's position update from client
type PositionPayload struct {
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	VelX     float64 `json:"velX"`
	VelY     float64 `json:"velY"`
	Facing   int     `json:"facing"`
	OnGround bool    `json:"onGround"`
	Health   int     `json:"health"`
}

// PlayerState represents a player's complete state for broadcasting
type PlayerState struct {
	Name      string  `json:"name"`
	Color     string  `json:"color"`
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	VelX      float64 `json:"velX"`
	VelY      float64 `json:"velY"`
	Facing    int     `json:"facing"`
	OnGround  bool    `json:"onGround"`
	Health    int     `json:"health"`
	KillCount int     `json:"killCount"`
}

// FirePayload represents a bullet fire request from client
type FirePayload struct {
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Direction int     `json:"direction"`
}

// BulletState represents a bullet's state for broadcasting
type BulletState struct {
	ID        string  `json:"id"`
	OwnerName string  `json:"ownerName"`
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Direction int     `json:"direction"`
}

// GameStatePayload represents the complete game state
type GameStatePayload struct {
	Players []PlayerState `json:"players"`
	Bullets []BulletState `json:"bullets"`
}

