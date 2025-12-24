export class Camera {
  constructor(canvasWidth, canvasHeight) {
    this.x = 0;
    this.y = 0;
    this.zoom = 0.6; // Zoom out to 60% (showing more world)
    this.width = canvasWidth / this.zoom;
    this.height = canvasHeight / this.zoom;
  }

  follow(player, worldWidth, worldHeight) {
    // Position player at 40% from left, 45% from top (gives more view ahead and above)
    this.x = player.pos.x + player.width / 2 - this.width * 0.4;
    this.y = player.pos.y + player.height / 2 - this.height * 0.45;

    // Clamp camera to world bounds
    this.x = Math.max(0, Math.min(this.x, worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, worldHeight - this.height));
  }

  apply(ctx) {
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  reset(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

