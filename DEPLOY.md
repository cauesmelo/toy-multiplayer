# Deployment Guide

Server: `172.233.11.197`

---

## 🚀 Quick Deploy (First Time)

### 1. Setup the server (one-time):

```bash
ssh root@172.233.11.197 'bash -s' < setup-server.sh
```

This configures:
- Deployment directory (`/opt/toy-game`)
- Firewall rules (ports 22, 80)
- Systemd service

### 2. Build and deploy:

```bash
./deploy-to-vps.sh
```

### 3. Start the game service:

```bash
ssh root@172.233.11.197
systemctl enable game-server
systemctl start game-server
```

### 4. Verify it's running:

```bash
systemctl status game-server
```

Your game is now live at: **http://172.233.11.197** 🎮

---

## 🔄 Update Deployment

To deploy changes:

```bash
./update-game.sh
```

This will:
1. Build the latest code
2. Deploy to server
3. Restart the service automatically

---

## 📊 Monitoring

### Check service status:
```bash
ssh root@172.233.11.197 'systemctl status game-server'
```

### View live logs:
```bash
ssh root@172.233.11.197 'journalctl -u game-server -f'
```

### Stop the service:
```bash
ssh root@172.233.11.197 'systemctl stop game-server'
```

### Restart the service:
```bash
ssh root@172.233.11.197 'systemctl restart game-server'
```

---

## 🐛 Troubleshooting

### Service won't start:
```bash
ssh root@172.233.11.197 'journalctl -u game-server -n 50'
```

### Check if port is in use:
```bash
ssh root@172.233.11.197 'lsof -i :80'
```

### Manually test the binary:
```bash
ssh root@172.233.11.197
cd /opt/toy-game
./game-server
# Press Ctrl+C to stop
```

### Check firewall:
```bash
ssh root@172.233.11.197 'ufw status'
```

---

## 🔒 Optional: Add Domain & SSL

### 1. Point your domain to the server

Add an A record:
```
yourdomain.com → 172.233.11.197
```

### 2. Install Nginx:

```bash
ssh root@172.233.11.197
apt update
apt install -y nginx certbot python3-certbot-nginx
```

### 3. Configure Nginx:

Create `/etc/nginx/sites-available/game`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /ws {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable it:
```bash
ln -s /etc/nginx/sites-available/game /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 4. Add SSL:

```bash
certbot --nginx -d yourdomain.com
```

Now accessible at: **https://yourdomain.com** 🔐

---

## 📦 File Structure on Server

```
/opt/toy-game/
├── game-server    (binary)
└── dist/          (static files)
    ├── index.html
    └── assets/
```

---

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `./deploy-to-vps.sh` | First-time deployment |
| `./update-game.sh` | Deploy updates |
| `ssh root@172.233.11.197` | SSH into server |
| `systemctl status game-server` | Check status |
| `journalctl -u game-server -f` | View logs |

---

## 🌐 Access URLs

- **Direct IP**: http://172.233.11.197
- **WebSocket**: ws://172.233.11.197/ws
- **Health Check**: http://172.233.11.197/health

