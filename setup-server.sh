#!/bin/bash
# Run this script ON YOUR VPS (not locally)
# Usage: ssh root@172.233.11.197 'bash -s' < setup-server.sh

set -e

echo "🔧 Setting up server for deployment..."

# Create deployment directory
mkdir -p /opt/toy-game

# Configure firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 22    # SSH
    ufw allow 80    # Game server (HTTP)
    echo "y" | ufw enable || true
fi

# Create systemd service
echo "📝 Creating systemd service..."
cat > /etc/systemd/system/game-server.service << 'EOF'
[Unit]
Description=Multiplayer Game Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/toy-game
ExecStart=/opt/toy-game/game-server
Restart=always
RestartSec=5
Environment="PORT=80"

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Now you can:"
echo "  1. Deploy your game: ./deploy-to-vps.sh"
echo "  2. Start the service: systemctl start game-server"
echo "  3. Enable on boot: systemctl enable game-server"
echo "  4. Check status: systemctl status game-server"
echo "  5. View logs: journalctl -u game-server -f"
echo ""
echo "Game will be served on port 80 (http://YOUR_IP)"

