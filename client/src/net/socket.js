class NetworkManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.playerName = null;
    this.playerColor = null;
    this.joinResolver = null;
    this.onStateUpdate = null; // Callback for game state updates
    this.onDisconnect = null; // Callback for when connection is lost
    this.intentionalDisconnect = false; // Track if disconnect was intentional
  }

  connect(playerName) {
    return new Promise((resolve, reject) => {
      this.playerName = playerName;
      this.joinResolver = resolve;
      this.intentionalDisconnect = false;
      this.socket = new WebSocket("ws://localhost:5173/ws");

      this.socket.onopen = () => {
        console.log("✅ Connected to server");
        this.connected = true;

        // Send join message
        this.send({
          type: "join",
          payload: {
            name: playerName,
          },
        });
      };

      this.socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        reject(error);
      };

      this.socket.onclose = (event) => {
        const wasConnected = this.connected;
        this.connected = false;
        
        // Only handle unexpected disconnects
        if (wasConnected && !this.intentionalDisconnect) {
          console.log("⚠️ Unexpectedly disconnected from server");
          if (this.onDisconnect) {
            this.onDisconnect("Connection to server lost");
          }
        } else if (this.intentionalDisconnect) {
          console.log("🔌 Disconnected from server");
        }
      };

      this.socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        this.handleMessage(msg);
      };
    });
  }

  send(message) {
    if (this.connected && this.socket) {
      this.socket.send(JSON.stringify(message));
    }
  }

  handleMessage(msg) {
    switch (msg.type) {
      case "joined":
        this.playerColor = msg.payload.color;
        console.log(`🎨 Assigned color: ${this.playerColor}`);
        if (this.joinResolver) {
          this.joinResolver({
            name: msg.payload.name,
            color: msg.payload.color,
          });
          this.joinResolver = null;
        }
        break;
      
      case "state":
        // Game state update from server
        if (this.onStateUpdate) {
          this.onStateUpdate(msg.payload.players);
        }
        break;
      
      case "error":
        console.error("Server error:", msg.payload.message);
        alert(`Server error: ${msg.payload.message}`);
        break;
      
      default:
        console.log("Unknown message type:", msg.type);
    }
  }

  sendPosition(x, y, velX, velY, facing, onGround) {
    this.send({
      type: "position",
      payload: {
        x,
        y,
        velX,
        velY,
        facing,
        onGround,
      },
    });
  }

  disconnect() {
    this.intentionalDisconnect = true;
    if (this.socket) {
      this.socket.close();
    }
  }
}

const networkManager = new NetworkManager();
export { networkManager };

