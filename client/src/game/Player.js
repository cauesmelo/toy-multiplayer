export class Player {
  constructor(x, y, name = "Player", color = "#4ECDC4") {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.spawnPos = { x, y };

    this.width = 32;
    this.height = 48;

    this.onGround = false;
    this.coyoteTime = 0;

    this.health = 3;
    this.maxHealth = 3;

    this.facingDirection = 1;
    this.fireRate = 0.3;
    this.lastShotTime = 0;

    this.name = name;
    this.color = color;
  }

  respawn() {
    this.pos.x = this.spawnPos.x;
    this.pos.y = this.spawnPos.y;
    this.vel.x = 0;
    this.vel.y = 0;
    this.onGround = false;
    this.coyoteTime = 0;
  }

  takeDamage(amount = 1) {
    this.health = Math.max(0, this.health - amount);
    return this.health;
  }

  isDead() {
    return this.health <= 0;
  }

  canShoot(currentTime) {
    return currentTime - this.lastShotTime >= this.fireRate;
  }

  shoot(currentTime) {
    this.lastShotTime = currentTime;
  }
}
