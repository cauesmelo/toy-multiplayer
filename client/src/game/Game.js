import { Player } from "./Player";
import { World } from "./World";
import { Camera } from "./Camera";
import { Bullet } from "./Bullet";
import { keys } from "../input/keyboard";
import { updatePlayer } from "./physics";
import { resolveVertical } from "./resolve";
import { renderWorld, renderPlayer, renderBullets } from "../render/renderer";
import { renderHealthBar, renderDebugInfo, renderKillCount } from "../render/ui";
import { networkManager } from "../net/socket";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.lastTime = 0;
    this.currentTime = 0;

    this.world = new World();
    this.player = null; // Will be created after name entry
    this.camera = new Camera(canvas.width, canvas.height);
    this.bullets = []; // Server-authoritative bullets
    this.otherPlayers = new Map(); // Map of playerName -> Player object

    this.devMode = false; // Developer mode toggle
    this.gameState = "menu"; // "menu" or "playing"

    this.loop = this.loop.bind(this);
    this.setupDevModeToggle();
    this.setupNameEntry();
    this.setupNetworkCallbacks();
  }

  setupNetworkCallbacks() {
    // Handle game state updates from server
    networkManager.onStateUpdate = (gameState) => {
      this.handleGameState(gameState);
    };

    // Handle unexpected disconnections
    networkManager.onDisconnect = (reason) => {
      this.handleUnexpectedDisconnect(reason);
    };
  }

  handleGameState(gameState) {
    if (!this.player) return;

    const { players, bullets } = gameState;

    // Update other players
    const currentPlayers = new Set();

    players.forEach((playerData) => {
      // Update our own player from server (for health and respawns)
      if (playerData.name === this.player.name) {
        this.player.health = playerData.health;
        this.player.killCount = playerData.killCount || 0;
        
        // If player respawned (position changed significantly), update position
        const distanceFromServer = Math.abs(this.player.pos.x - playerData.x) + Math.abs(this.player.pos.y - playerData.y);
        if (distanceFromServer > 500) {
          // Teleported/respawned - sync position from server
          this.player.pos.x = playerData.x;
          this.player.pos.y = playerData.y;
          this.player.vel.x = playerData.velX;
          this.player.vel.y = playerData.velY;
        }
        return;
      }

      currentPlayers.add(playerData.name);

      // Update or create other player
      if (this.otherPlayers.has(playerData.name)) {
        const otherPlayer = this.otherPlayers.get(playerData.name);
        otherPlayer.pos.x = playerData.x;
        otherPlayer.pos.y = playerData.y;
        otherPlayer.vel.x = playerData.velX;
        otherPlayer.vel.y = playerData.velY;
        otherPlayer.facingDirection = playerData.facing;
        otherPlayer.onGround = playerData.onGround;
        otherPlayer.health = playerData.health;
        otherPlayer.killCount = playerData.killCount || 0;
      } else {
        // Create new player
        const otherPlayer = new Player(
          playerData.x,
          playerData.y,
          playerData.name,
          playerData.color
        );
        otherPlayer.health = playerData.health;
        otherPlayer.killCount = playerData.killCount || 0;
        this.otherPlayers.set(playerData.name, otherPlayer);
        console.log(`➕ Player ${playerData.name} joined the game`);
      }
    });

    // Remove players that disconnected
    for (const [name, player] of this.otherPlayers.entries()) {
      if (!currentPlayers.has(name)) {
        this.otherPlayers.delete(name);
        console.log(`➖ Player ${name} left the game`);
      }
    }

    // Update bullets from server
    this.bullets = (bullets || []).map((bulletData) => ({
      id: bulletData.id,
      ownerName: bulletData.ownerName,
      pos: { x: bulletData.x, y: bulletData.y },
      direction: bulletData.direction,
      width: 8,
      height: 4,
    }));
  }

  setupNameEntry() {
    const form = document.getElementById("name-entry-form");
    const input = document.getElementById("player-name-input");
    const errorMsg = document.getElementById("name-error");
    
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const playerName = input.value.trim();
      
      // Validate name is not empty
      if (playerName.length === 0) {
        errorMsg.style.display = "block";
        input.focus();
        return;
      }
      
      // Hide error if shown
      errorMsg.style.display = "none";
      
      // Start game with validated name
      this.startGame(playerName);
    });
    
    // Hide error on input
    input.addEventListener("input", () => {
      if (input.value.trim().length > 0) {
        errorMsg.style.display = "none";
      }
    });
    
    // Focus input on load
    input.focus();
  }

  async startGame(playerName) {
    try {
      // Connect to server and send player name
      const playerData = await networkManager.connect(playerName);
      
      // Create local player with assigned color
      this.player = new Player(100, 1600, playerData.name, playerData.color);
      this.gameState = "playing";
      this.lastPositionSent = 0; // Track when we last sent position
      
      // Hide menu
      document.getElementById("name-entry-screen").style.display = "none";
      document.getElementById("game").style.display = "block";
      
      console.log(`🎮 Game started! Welcome, ${playerData.name} (${playerData.color})`);
    } catch (error) {
      console.error("Failed to connect to server:", error);
      alert("Failed to connect to server. Please make sure the server is running.");
    }
  }

  setupDevModeToggle() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyQ") {
        this.devMode = !this.devMode;
        console.log(`Developer mode: ${this.devMode ? "ON" : "OFF"}`);
      }
      
      // ESC to disconnect
      if (e.code === "Escape" && this.gameState === "playing") {
        this.handleDisconnect();
      }
    });
  }

  handleDisconnect() {
    console.log("🔌 Disconnecting from server...");
    
    // Disconnect from server
    networkManager.disconnect();
    
    // Reset game state
    this.gameState = "menu";
    this.player = null;
    this.bullets = [];
    this.otherPlayers.clear();
    
    // Show menu, hide game
    document.getElementById("name-entry-screen").style.display = "flex";
    document.getElementById("game").style.display = "none";
    
    // Clear and focus input
    const input = document.getElementById("player-name-input");
    input.value = "";
    input.focus();
    
    console.log("✅ Disconnected. Ready to reconnect.");
  }

  handleUnexpectedDisconnect(reason) {
    console.error("⚠️ Unexpected disconnect:", reason);
    
    // Reset game state
    this.gameState = "menu";
    this.player = null;
    this.bullets = [];
    this.otherPlayers.clear();
    
    // Show menu, hide game
    document.getElementById("name-entry-screen").style.display = "flex";
    document.getElementById("game").style.display = "none";
    
    // Show error message to user
    const input = document.getElementById("player-name-input");
    const errorMsg = document.getElementById("name-error");
    errorMsg.textContent = reason + ". Please reconnect.";
    errorMsg.style.display = "block";
    
    // Keep the player's name so they can easily reconnect
    // input.value is already filled from before
    input.focus();
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      errorMsg.style.display = "none";
      errorMsg.textContent = "Please enter your name";
    }, 5000);
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  loop(time) {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.currentTime = time / 1000; // Convert to seconds

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (this.gameState !== "playing" || !this.player) return;

    updatePlayer(this.player, this.world, keys, dt);
    resolveVertical(this.player, this.world);

    // Send position updates to server (30 times per second)
    const positionUpdateRate = 1 / 30;
    if (this.currentTime - this.lastPositionSent >= positionUpdateRate) {
      networkManager.sendPosition(
        this.player.pos.x,
        this.player.pos.y,
        this.player.vel.x,
        this.player.vel.y,
        this.player.facingDirection,
        this.player.onGround,
        this.player.health
      );
      this.lastPositionSent = this.currentTime;
    }

    // Handle shooting
    if (keys.shoot && this.player.canShoot(this.currentTime)) {
      this.fireBullet();
      this.player.shoot(this.currentTime);
    }
    
    this.camera.follow(this.player, this.world.width, this.world.height);
  }

  fireBullet() {
    // Send bullet fire message to server
    const bulletX = this.player.pos.x + this.player.width / 2;
    const bulletY = this.player.pos.y + this.player.height / 2;
    
    networkManager.send({
      type: "fire",
      payload: {
        x: bulletX,
        y: bulletY,
        direction: this.player.facingDirection,
      },
    });
  }

  render() {
    if (this.gameState !== "playing" || !this.player) return;

    // Clear entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transformation
    this.ctx.save();
    this.camera.apply(this.ctx);

    // Render game world
    renderWorld(this.ctx, this.world);
    
    // Render other players (with health boxes)
    for (const otherPlayer of this.otherPlayers.values()) {
      renderPlayer(this.ctx, otherPlayer, false);
    }
    
    // Render local player on top (without health boxes below)
    renderPlayer(this.ctx, this.player, true);
    renderBullets(this.ctx, this.bullets);

    // Restore camera transformation
    this.ctx.restore();

    // UI overlay (not affected by camera)
    renderHealthBar(this.ctx, this.player);
    renderKillCount(this.ctx, this.player, this.canvas.width);
    
    // Debug info (only in dev mode)
    if (this.devMode) {
      renderDebugInfo(this.ctx, this.player, this.camera);
    }
  }
}
