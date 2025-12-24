import { Palette } from "./palette";

export function renderHealthBar(ctx, player) {
  const boxSize = 30;
  const boxPadding = 5;
  const startX = 10;
  const startY = 10;

  for (let i = 0; i < player.maxHealth; i++) {
    const x = startX + i * (boxSize + boxPadding);

    // Outline
    ctx.fillStyle = Palette.world.frame;
    ctx.fillRect(x - 2, startY - 2, boxSize + 4, boxSize + 4);

    if (i < player.health) {
      // Filled box (alive) - softer red
      ctx.fillStyle = Palette.ui.warning;
    } else {
      // Empty box (lost) - background alt
      ctx.fillStyle = Palette.world.backgroundAlt;
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

  // Background
  ctx.fillStyle = Palette.world.backgroundAlt;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  // Border (subtle)
  ctx.fillStyle = Palette.world.frame;
  ctx.fillRect(panelX, panelY, panelWidth, 2); // top
  ctx.fillRect(panelX, panelY, 2, panelHeight); // left
  ctx.fillRect(panelX + panelWidth - 2, panelY, 2, panelHeight); // right
  ctx.fillRect(panelX, panelY + panelHeight - 2, panelWidth, 2); // bottom

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
