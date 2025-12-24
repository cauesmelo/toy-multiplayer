import { Palette } from "./palette";

export function renderHealthBar(ctx, player) {
  const boxSize = 30;
  const boxPadding = 5;
  const startX = 10;
  const startY = 10;

  for (let i = 0; i < player.maxHealth; i++) {
    const x = startX + i * (boxSize + boxPadding);

    // Outline (darker for visibility on light background)
    ctx.fillStyle = Palette.world.outline;
    ctx.fillRect(x - 2, startY - 2, boxSize + 4, boxSize + 4);

    if (i < player.health) {
      // Filled box (alive) - vibrant red
      ctx.fillStyle = Palette.ui.warning;
    } else {
      // Empty box (lost) - white/light
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    }

    ctx.fillRect(x, startY, boxSize, boxSize);
  }
}

export function renderDebugInfo(ctx, player, camera) {
  const panelX = 5;
  const panelY = 50;
  const panelWidth = 280;
  const panelHeight = 82;
  const padding = 8;

  // Background (white with slight transparency)
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  // Border (darker for contrast)
  ctx.fillStyle = Palette.world.outline;
  ctx.strokeStyle = Palette.world.outline;
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  // Title
  ctx.fillStyle = Palette.ui.accent;
  ctx.font = "bold 11px monospace";
  ctx.fillText("DEV MODE (Q to toggle)", panelX + padding, panelY + 16);

  // Debug info
  ctx.fillStyle = Palette.ui.text;
  ctx.font = "10px monospace";

  const textX = panelX + padding;
  let textY = panelY + 32;
  const lineHeight = 14;

  ctx.fillText(
    `Position: ${Math.round(player.pos.x)}, ${Math.round(player.pos.y)}`,
    textX,
    textY
  );
  textY += lineHeight;

  ctx.fillText(
    `Camera: ${Math.round(camera.x)}, ${Math.round(camera.y)}`,
    textX,
    textY
  );
  textY += lineHeight;

  ctx.fillText(`On Ground: ${player.onGround}`, textX, textY);
  textY += lineHeight;

  ctx.fillText(`Coyote: ${player.coyoteTime.toFixed(3)}s`, textX, textY);
}
