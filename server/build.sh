#!/bin/bash
set -e

echo "🔨 Building client..."
cd ../client
npm run build

echo "📦 Copying client build to server/cmd/server/static..."
cd ../server
rm -rf cmd/server/static
mkdir -p cmd/server/static
cp -r ../client/dist/* cmd/server/static/

echo "🏗️  Building Go server..."
cd cmd/server
go build -o ../../bin/server

echo "✅ Build complete! Binary is in server/bin/server"
echo ""
echo "To run the server:"
echo "  ./bin/server"
echo ""
echo "Or from the server directory:"
echo "  cd server && ./bin/server"

