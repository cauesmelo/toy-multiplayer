# Toy Multiplayer Server

A WebSocket-based multiplayer game server written in Go.

## Development

### Prerequisites

- Go 1.21+
- Node.js and npm (for building the client)

### Running in Development

1. **Start the Go server with hot-reload:**

   ```bash
   cd server
   air
   ```

2. **Start the client dev server (in a separate terminal):**
   ```bash
   cd client
   npm run dev
   ```

The client dev server will proxy WebSocket connections to the Go server.

## Production Build

### Build Everything

```bash
cd server
./build.sh
```

This will:

1. Build the client (Vite) → `client/dist/`
2. Build the Go server for Linux → `server/bin/game-server`

### Test Locally

For local testing with the production build:

```bash
cd server
./build-local.sh

# This creates ./runtime/ with the correct layout
cd ../runtime
./game-server
```

The server will serve both the game and WebSocket on port 80:

- Game: http://localhost
- WebSocket: ws://localhost/ws
- Health check: http://localhost/health

### Environment Variables

- `PORT`: Server port (default: 8080 for dev, 80 for production)

## Deployment

### Deployment

### Runtime Layout

The server expects this directory structure:

```
/opt/toy-game/
├── game-server   (binary)
└── dist/         (static files)
```

### Deploy to VPS

After running `./build.sh`:

```bash
# Copy files to server
scp server/bin/game-server root@SERVER_IP:/opt/toy-game/
scp -r client/dist root@SERVER_IP:/opt/toy-game/

# SSH into server
ssh root@SERVER_IP
cd /opt/toy-game
./game-server
```

### Systemd Service

Create `/etc/systemd/system/game-server.service`:

```ini
[Unit]
Description=Multiplayer Game Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/toy-game
ExecStart=/opt/toy-game/game-server
Restart=always
Environment="PORT=80"

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl enable game-server
systemctl start game-server
```

The server reads from the `PORT` environment variable (default: 8080 for dev, 80 for production).
