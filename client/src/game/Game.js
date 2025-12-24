import { Player } from "./Player";
import { World } from "./World";
import { Camera } from "./Camera";
import { Bullet } from "./Bullet";
import { keys } from "../input/keyboard";
import { updatePlayer } from "./physics";
import { resolveVertical } from "./resolve";
import { renderWorld, renderPlayer, renderBullets } from "../render/renderer";
import { renderHealthBar, renderDebugInfo } from "../render/ui";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.lastTime = 0;
    this.currentTime = 0;

    this.world = new World();
    this.player = new Player(100, 1600);
    this.camera = new Camera(canvas.width, canvas.height);
    this.bullets = [];

    this.devMode = false; // Developer mode toggle

    this.loop = this.loop.bind(this);
    this.setupDevModeToggle();
  }

  setupDevModeToggle() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyQ") {
        this.devMode = !this.devMode;
        console.log(`Developer mode: ${this.devMode ? "ON" : "OFF"}`);
      }
    });
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
    updatePlayer(this.player, this.world, keys, dt);
    resolveVertical(this.player, this.world);

    // Handle shooting
    if (keys.shoot && this.player.canShoot(this.currentTime)) {
      this.fireBullet();
      this.player.shoot(this.currentTime);
    }

    // Update bullets
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(dt);
      // Remove bullets that are expired or out of bounds
      return (
        !bullet.isExpired() &&
        bullet.pos.x > 0 &&
        bullet.pos.x < this.world.width
      );
    });

    // Check if player fell into pit (death zone)
    if (this.player.pos.y > this.world.height) {
      const remainingHealth = this.player.takeDamage(1);

      if (remainingHealth > 0) {
        // Still alive, respawn
        this.player.respawn();
      } else {
        // Game over - could add game over screen here
        // For now, just respawn with full health
        this.player.health = this.player.maxHealth;
        this.player.respawn();
      }
    }

    this.camera.follow(this.player, this.world.width, this.world.height);
  }

  fireBullet() {
    // Spawn bullet from center of player, in facing direction
    const bulletX = this.player.pos.x + this.player.width / 2;
    const bulletY = this.player.pos.y + this.player.height / 2;
    const bullet = new Bullet(bulletX, bulletY, this.player.facingDirection);
    this.bullets.push(bullet);
  }

  render() {
    // Clear entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transformation
    this.ctx.save();
    this.camera.apply(this.ctx);

    // Render game world
    renderWorld(this.ctx, this.world);
    renderPlayer(this.ctx, this.player);
    renderBullets(this.ctx, this.bullets);

    // Restore camera transformation
    this.ctx.restore();

    // UI overlay (not affected by camera)
    renderHealthBar(this.ctx, this.player);
    
    // Debug info (only in dev mode)
    if (this.devMode) {
      renderDebugInfo(this.ctx, this.player, this.camera);
    }
  }
}
