export class Player {
  constructor(x, y) {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };

    this.width = 32;
    this.height = 48;

    this.onGround = false;
    this.coyoteTime = 0; // Time since leaving ground
  }
}
