export class Game {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.lastTime = 0;
  }

  start() {
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(time) {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // input + prediction
  }

  render() {
    this.ctx.clearRect(0, 0, 800, 600);
    // draw players
  }
}
