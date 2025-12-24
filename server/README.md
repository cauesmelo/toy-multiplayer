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

1. Build the client (Vite)
2. Copy the client build to `server/cmd/server/static/`
3. Build the Go server with embedded static files
4. Output a single binary to `server/bin/server`

### Run the Production Server

```bash
cd server
./bin/server
```

Or from the root:

```bash
./server/bin/server
```

The server will serve both the game and WebSocket on port 8080:

- Game: http://localhost:8080
- WebSocket: ws://localhost:8080/ws
- Health check: http://localhost:8080/health

### Environment Variables

- `PORT`: Server port (default: 8080)

## Deployment

The built binary in `server/bin/server` is self-contained and includes all static files. You can deploy just this single binary to any cloud provider.

### Deployment

The built binary can be deployed to any VPS or cloud platform that supports Go applications. Simply:

1. Build the binary: `./build.sh`
2. Copy `server/bin/server` to your deployment server
3. Run it with `./server`

The server will use port 8080 by default, or read from the `PORT` environment variable.
