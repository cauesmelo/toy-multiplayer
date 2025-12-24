import { Player } from "./Player";
import { World } from "./World";
import { Camera } from "./Camera";
import { keys } from "../input/keyboard";
import { updatePlayer } from "./physics";
import { resolveVertical } from "./resolve";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.lastTime = 0;

    this.world = new World();
    this.player = new Player(100, 1600);
    this.camera = new Camera(canvas.width, canvas.height);

    this.loop = this.loop.bind(this);
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  loop(time) {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  }

  update(dt) {
    updatePlayer(this.player, this.world, keys, dt);
    resolveVertical(this.player, this.world);
    this.camera.follow(this.player, this.world.width, this.world.height);
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

    // Restore camera transformation
    this.ctx.restore();

    // UI overlay (not affected by camera)
    this.renderUI();
  }

  renderUI() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "14px monospace";
    this.ctx.fillText(
      `Position: ${Math.round(this.player.pos.x)}, ${Math.round(
        this.player.pos.y
      )}`,
      10,
      20
    );
    this.ctx.fillText(
      `Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`,
      10,
      40
    );
    this.ctx.fillText(`On Ground: ${this.player.onGround}`, 10, 60);
    this.ctx.fillText(
      `Coyote Time: ${this.player.coyoteTime.toFixed(3)}s`,
      10,
      80
    );
  }
}
