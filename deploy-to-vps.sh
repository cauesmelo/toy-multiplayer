#!/bin/bash
set -e

SERVER_IP="172.233.11.197"
SERVER_USER="root"
DEPLOY_PATH="/opt/toy-game"

echo "🚀 Deploying to VPS: $SERVER_IP"
echo ""

# Check if build exists
if [ ! -f "server/bin/game-server" ] || [ ! -d "client/dist" ]; then
    echo "❌ Build not found. Running build first..."
    cd server
    ./build.sh
    cd ..
fi

echo "📦 Deploying files..."

# Create deployment directory on server
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"

# Copy binary
echo "  → Copying game-server binary..."
scp server/bin/game-server ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# Copy static files
echo "  → Copying client files..."
scp -r client/dist ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. SSH into server: ssh ${SERVER_USER}@${SERVER_IP}"
echo "  2. Test manually: cd ${DEPLOY_PATH} && ./game-server"
echo "  3. Or set up systemd service (see README.md)"
echo ""
echo "Your game will be available at: http://${SERVER_IP}"

