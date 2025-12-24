export function renderWorld(ctx, world) {
  // Background - light blue-gray sky
  ctx.fillStyle = "#b8c6db";
  ctx.fillRect(0, 0, world.width, world.height);

  // Platforms - medium gray with subtle outline
  ctx.fillStyle = "#5a6c7d";
  for (const platform of world.platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Platform highlight
    ctx.fillStyle = "#6c7f93";
    ctx.fillRect(platform.x, platform.y, platform.width, 3);

    // Reset for next platform
    ctx.fillStyle = "#5a6c7d";
  }
}

export function renderPlayer(ctx, player) {
  // Player body - rich purple
  ctx.fillStyle = "#6a4c93";
  ctx.fillRect(player.pos.x, player.pos.y, player.width, player.height);

  // Player outline/shadow
  ctx.strokeStyle = "#3d2d5f";
  ctx.lineWidth = 2;
  ctx.strokeRect(player.pos.x, player.pos.y, player.width, player.height);

  // Gun barrel - gold/yellow
  ctx.fillStyle = "#ffd23f";
  const gunLength = 15;
  const gunY = player.pos.y + player.height / 2 - 2;

  if (player.facingDirection === 1) {
    ctx.fillRect(player.pos.x + player.width, gunY, gunLength, 4);
  } else {
    ctx.fillRect(player.pos.x - gunLength, gunY, gunLength, 4);
  }
}

export function renderBullets(ctx, bullets) {
  for (const bullet of bullets) {
    // Bullet glow effect - dark outline for contrast
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(
      bullet.pos.x - 2,
      bullet.pos.y - 2,
      bullet.width + 4,
      bullet.height + 4
    );

    // Bullet bright outer
    ctx.fillStyle = "#ff1744";
    ctx.fillRect(
      bullet.pos.x - 1,
      bullet.pos.y - 1,
      bullet.width + 2,
      bullet.height + 2
    );

    // Bullet core - bright red
    ctx.fillStyle = "#ff5252";
    ctx.fillRect(bullet.pos.x, bullet.pos.y, bullet.width, bullet.height);
  }
}
