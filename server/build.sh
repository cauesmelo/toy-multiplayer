#!/bin/bash
set -e

echo "🔨 Building client..."
cd ../client
npm install
npm run build

echo "🏗️  Building Go server (Linux)..."
cd ../server

mkdir -p bin

GOOS=linux GOARCH=amd64 go build -o bin/game-server ./cmd/server

echo "✅ Build complete!"
echo ""
echo "Artifacts:"
echo "  - Client: client/dist/"
echo "  - Server: server/bin/game-server"
echo ""
echo "Deployment layout should be:"
echo "  /opt/toy-game/"
echo "    ├── game-server"
echo "    └── dist/"
echo ""
echo "To deploy:"
echo "  scp server/bin/game-server root@SERVER_IP:/opt/toy-game/"
echo "  scp -r client/dist root@SERVER_IP:/opt/toy-game/"

