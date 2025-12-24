#!/bin/bash
set -e

SERVER_IP="172.233.11.197"
SERVER_USER="root"
DEPLOY_PATH="/opt/toy-game"

echo "🔄 Updating game on VPS..."

# Build
echo "🔨 Building..."
cd server
./build.sh
cd ..

# Deploy
echo "📦 Deploying..."
scp server/bin/game-server ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/
scp -r client/dist ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# Restart service
echo "🔄 Restarting service..."
ssh ${SERVER_USER}@${SERVER_IP} "systemctl restart game-server"

echo ""
echo "✅ Update complete!"
echo ""
echo "Check status:"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'systemctl status game-server'"
echo ""
echo "View logs:"
echo "  ssh ${SERVER_USER}@${SERVER_IP} 'journalctl -u game-server -f'"

