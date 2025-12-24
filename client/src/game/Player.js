export class Player {
  constructor(x, y) {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.spawnPos = { x, y }; // Remember spawn position for respawn

    this.width = 32;
    this.height = 48;

    this.onGround = false;
    this.coyoteTime = 0; // Time since leaving ground
    
    this.health = 3;
    this.maxHealth = 3;
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
}
