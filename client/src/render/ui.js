export function renderHealthBar(ctx, player) {
  const boxSize = 30;
  const boxPadding = 5;
  const startX = 10;
  const startY = 10;

  for (let i = 0; i < player.maxHealth; i++) {
    const x = startX + i * (boxSize + boxPadding);

    if (i < player.health) {
      // Filled box (alive) - red
      ctx.fillStyle = "#e63946";
    } else {
      // Empty box (lost) - light gray
      ctx.fillStyle = "#95a5a6";
    }

    ctx.fillRect(x, startY, boxSize, boxSize);

    // Outline - dark to match player
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, startY, boxSize, boxSize);
  }
}

export function renderDebugInfo(ctx, player, camera) {
  // Semi-transparent background for better readability
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(5, 50, 260, 75);
  
  // Border
  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 2;
  ctx.strokeRect(5, 50, 260, 75);
  
  // Title
  ctx.fillStyle = "#e63946";
  ctx.font = "bold 12px monospace";
  ctx.fillText("DEV MODE (Q to toggle)", 10, 65);
  
  // Debug info
  ctx.fillStyle = "#2c3e50";
  ctx.font = "11px monospace";
  ctx.fillText(
    `Position: ${Math.round(player.pos.x)}, ${Math.round(player.pos.y)}`,
    10,
    82
  );
  ctx.fillText(
    `Camera: ${Math.round(camera.x)}, ${Math.round(camera.y)}`,
    10,
    96
  );
  ctx.fillText(`On Ground: ${player.onGround}`, 10, 110);
  ctx.fillText(`Coyote Time: ${player.coyoteTime.toFixed(3)}s`, 10, 120);
}
