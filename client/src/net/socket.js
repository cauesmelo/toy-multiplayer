class NetworkManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.playerName = null;
  }

  connect(playerName) {
    return new Promise((resolve, reject) => {
      this.playerName = playerName;
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

        resolve();
      };

      this.socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log("🔌 Disconnected from server");
        this.connected = false;
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
    console.log("📨 Message from server:", msg);

    switch (msg.type) {
      case "error":
        console.error("Server error:", msg.payload.message);
        alert(`Server error: ${msg.payload.message}`);
        break;
      // Add more message handlers here as we implement them
      default:
        console.log("Unknown message type:", msg.type);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

const networkManager = new NetworkManager();
export { networkManager };

