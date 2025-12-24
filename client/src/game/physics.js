import { MOVE_ACCEL, MAX_SPEED, JUMP_VELOCITY, COYOTE_TIME } from "./constants";

export function updatePlayer(player, world, input, dt) {
  // Update coyote time
  if (!player.onGround) {
    player.coyoteTime += dt;
  } else {
    player.coyoteTime = 0;
  }

  // Horizontal movement
  if (input.left) {
    player.vel.x -= MOVE_ACCEL * dt;
  } else if (input.right) {
    player.vel.x += MOVE_ACCEL * dt;
  } else {
    player.vel.x *= 0.8; // friction
  }

  // Clamp horizontal speed
  player.vel.x = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vel.x));

  // Jump - allow if on ground OR within coyote time
  const canJump = player.onGround || player.coyoteTime < COYOTE_TIME;
  if (input.jump && canJump && player.vel.y >= 0) {
    player.vel.y = JUMP_VELOCITY;
    player.coyoteTime = COYOTE_TIME; // Consume coyote time
  }

  // Gravity
  player.vel.y += world.gravity * dt;

  // Apply movement
  player.pos.x += player.vel.x * dt;
  player.pos.y += player.vel.y * dt;
}
