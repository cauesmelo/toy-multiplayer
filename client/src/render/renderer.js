export function renderWorld(ctx, world) {
  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, world.width, world.height);

  // Platforms
  ctx.fillStyle = "#444";
  for (const platform of world.platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  }
}

export function renderPlayer(ctx, player) {
  // Player body
  ctx.fillStyle = "blue";
  ctx.fillRect(player.pos.x, player.pos.y, player.width, player.height);

  // Gun barrel
  ctx.fillStyle = "white";
  const gunLength = 15;
  const gunY = player.pos.y + player.height / 2 - 2;

  if (player.facingDirection === 1) {
    ctx.fillRect(player.pos.x + player.width, gunY, gunLength, 4);
  } else {
    ctx.fillRect(player.pos.x - gunLength, gunY, gunLength, 4);
  }
}

export function renderBullets(ctx, bullets) {
  ctx.fillStyle = "red";
  for (const bullet of bullets) {
    ctx.fillRect(bullet.pos.x, bullet.pos.y, bullet.width, bullet.height);
  }
}
