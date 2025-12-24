import { Palette } from "./palette";

export function renderWorld(ctx, world) {
  // Outer background (darkest)
  ctx.fillStyle = Palette.world.background;
  ctx.fillRect(0, 0, world.width, world.height);

  // Inner vignette (subtle center lightening)
  ctx.fillStyle = Palette.world.backgroundAlt;
  ctx.fillRect(20, 20, world.width - 40, world.height - 40);

  // Platforms with depth
  for (const platform of world.platforms) {
    // Platform body (mid value)
    ctx.fillStyle = Palette.world.platform;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Top edge highlight (3px - implies light from above)
    ctx.fillStyle = Palette.world.platformEdge;
    ctx.fillRect(platform.x, platform.y, platform.width, 3);
  }
}

export function renderPlayer(ctx, player) {
  // Player name above head
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  // Name background
  const nameWidth = ctx.measureText(player.name).width;
  const namePadding = 4;
  ctx.fillStyle = Palette.world.backgroundAlt;
  ctx.fillRect(
    player.pos.x + player.width / 2 - nameWidth / 2 - namePadding,
    player.pos.y - 18,
    nameWidth + namePadding * 2,
    14
  );

  // Name text
  ctx.fillStyle = Palette.ui.text;
  ctx.fillText(player.name, player.pos.x + player.width / 2, player.pos.y - 6);

  // Reset alignment
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Player outline (thick border for visibility)
  ctx.fillStyle = Palette.world.outline;
  ctx.fillRect(
    player.pos.x - 2,
    player.pos.y - 2,
    player.width + 4,
    player.height + 4
  );

  // Player body - use first player color (crimson)
  ctx.fillStyle = Palette.players[0];
  ctx.fillRect(player.pos.x, player.pos.y, player.width, player.height);

  // Gun barrel outline
  const gunLength = 15;
  const gunY = player.pos.y + player.height / 2 - 2;
  const gunThickness = 4;

  if (player.facingDirection === 1) {
    // Gun outline
    ctx.fillStyle = Palette.world.outline;
    ctx.fillRect(
      player.pos.x + player.width,
      gunY - 1,
      gunLength + 2,
      gunThickness + 2
    );
    // Gun body
    ctx.fillStyle = Palette.ui.accent;
    ctx.fillRect(player.pos.x + player.width, gunY, gunLength, gunThickness);
  } else {
    // Gun outline
    ctx.fillStyle = Palette.world.outline;
    ctx.fillRect(
      player.pos.x - gunLength - 2,
      gunY - 1,
      gunLength + 2,
      gunThickness + 2
    );
    // Gun body
    ctx.fillStyle = Palette.ui.accent;
    ctx.fillRect(player.pos.x - gunLength, gunY, gunLength, gunThickness);
  }
}

export function renderBullets(ctx, bullets) {
  for (const bullet of bullets) {
    // Bullet outline
    ctx.fillStyle = Palette.world.outline;
    ctx.fillRect(
      bullet.pos.x - 2,
      bullet.pos.y - 2,
      bullet.width + 4,
      bullet.height + 4
    );

    // Bullet glow (warning color for visibility)
    ctx.fillStyle = Palette.ui.warning;
    ctx.fillRect(
      bullet.pos.x - 1,
      bullet.pos.y - 1,
      bullet.width + 2,
      bullet.height + 2
    );

    // Bullet core (accent color)
    ctx.fillStyle = Palette.ui.accent;
    ctx.fillRect(bullet.pos.x, bullet.pos.y, bullet.width, bullet.height);
  }
}
