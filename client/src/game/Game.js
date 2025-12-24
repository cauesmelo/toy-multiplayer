import { Player } from "./Player";
import { World } from "./World";
import { Camera } from "./Camera";
import { Bullet } from "./Bullet";
import { keys } from "../input/keyboard";
import { updatePlayer } from "./physics";
import { resolveVertical } from "./resolve";

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

    this.loop = this.loop.bind(this);
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

    // Background
    this.ctx.fillStyle = "#0a0a0a";
    this.ctx.fillRect(0, 0, this.world.width, this.world.height);

    // Platforms
    this.ctx.fillStyle = "#444";
    for (const p of this.world.platforms) {
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    // Player
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(
      this.player.pos.x,
      this.player.pos.y,
      this.player.width,
      this.player.height
    );

    // Gun barrel indicator
    this.ctx.fillStyle = "white";
    const gunLength = 15;
    const gunY = this.player.pos.y + this.player.height / 2 - 2;
    if (this.player.facingDirection === 1) {
      this.ctx.fillRect(
        this.player.pos.x + this.player.width,
        gunY,
        gunLength,
        4
      );
    } else {
      this.ctx.fillRect(this.player.pos.x - gunLength, gunY, gunLength, 4);
    }

    // Bullets
    this.ctx.fillStyle = "yellow";
    for (const bullet of this.bullets) {
      this.ctx.fillRect(
        bullet.pos.x,
        bullet.pos.y,
        bullet.width,
        bullet.height
      );
    }

    // Restore camera transformation
    this.ctx.restore();

    // UI overlay (not affected by camera)
    this.renderUI();
  }

  renderUI() {
    // Health bar - simple red boxes
    const boxSize = 30;
    const boxPadding = 5;
    const startX = 10;
    const startY = 10;

    for (let i = 0; i < this.player.maxHealth; i++) {
      const x = startX + i * (boxSize + boxPadding);

      if (i < this.player.health) {
        // Filled box (alive)
        this.ctx.fillStyle = "red";
      } else {
        // Empty box (lost)
        this.ctx.fillStyle = "#333";
      }

      this.ctx.fillRect(x, startY, boxSize, boxSize);

      // Outline
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, startY, boxSize, boxSize);
    }

    // Debug info below health bar
    this.ctx.fillStyle = "white";
    this.ctx.font = "12px monospace";
    this.ctx.fillText(
      `Position: ${Math.round(this.player.pos.x)}, ${Math.round(
        this.player.pos.y
      )}`,
      10,
      60
    );
    this.ctx.fillText(
      `Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`,
      10,
      75
    );
    this.ctx.fillText(`On Ground: ${this.player.onGround}`, 10, 90);
    this.ctx.fillText(
      `Coyote Time: ${this.player.coyoteTime.toFixed(3)}s`,
      10,
      105
    );
  }
}
