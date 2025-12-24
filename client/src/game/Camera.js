export class Camera {
  constructor(canvasWidth, canvasHeight) {
    this.x = 0;
    this.y = 0;
    this.width = canvasWidth;
    this.height = canvasHeight;
  }

  follow(player, worldWidth, worldHeight) {
    // Center camera on player
    this.x = player.pos.x + player.width / 2 - this.width / 2;
    this.y = player.pos.y + player.height / 2 - this.height / 2;

    // Clamp camera to world bounds
    this.x = Math.max(0, Math.min(this.x, worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, worldHeight - this.height));
  }

  apply(ctx) {
    ctx.translate(-this.x, -this.y);
  }

  reset(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

