#!/bin/bash
set -e

echo "🔨 Building for local testing..."

# Build client
echo "Building client..."
cd ../client
npm run build

# Build Go server for local OS
echo "Building Go server (native)..."
cd ../server
mkdir -p bin
go build -o bin/game-server ./cmd/server

# Create runtime layout
echo "Creating runtime layout..."
cd ..
rm -rf runtime
mkdir -p runtime
cp server/bin/game-server runtime/
cp -r client/dist runtime/

echo "✅ Build complete!"
echo ""
echo "To run locally:"
echo "  cd runtime && ./game-server"
echo ""
echo "Then visit: http://localhost:8080"

