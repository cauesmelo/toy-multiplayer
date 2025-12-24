export class Bullet {
  constructor(x, y, direction) {
    this.pos = { x, y };
    this.direction = direction; // 1 for right, -1 for left
    this.speed = 1600; // pixels per second
    this.width = 10;
    this.height = 4;
    this.lifetime = 3; // seconds before bullet disappears
    this.age = 0;
  }

  update(dt) {
    this.pos.x += this.direction * this.speed * dt;
    this.age += dt;
  }

  isExpired() {
    return this.age >= this.lifetime;
  }
}
