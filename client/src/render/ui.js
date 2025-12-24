export function renderHealthBar(ctx, player) {
  const boxSize = 30;
  const boxPadding = 5;
  const startX = 10;
  const startY = 10;

  for (let i = 0; i < player.maxHealth; i++) {
    const x = startX + i * (boxSize + boxPadding);

    if (i < player.health) {
      // Filled box (alive)
      ctx.fillStyle = "red";
    } else {
      // Empty box (lost)
      ctx.fillStyle = "#333";
    }

    ctx.fillRect(x, startY, boxSize, boxSize);

    // Outline
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, startY, boxSize, boxSize);
  }
}

export function renderDebugInfo(ctx, player, camera) {
  ctx.fillStyle = "white";
  ctx.font = "12px monospace";
  
  ctx.fillText(
    `Position: ${Math.round(player.pos.x)}, ${Math.round(player.pos.y)}`,
    10,
    60
  );
  ctx.fillText(
    `Camera: ${Math.round(camera.x)}, ${Math.round(camera.y)}`,
    10,
    75
  );
  ctx.fillText(`On Ground: ${player.onGround}`, 10, 90);
  ctx.fillText(
    `Coyote Time: ${player.coyoteTime.toFixed(3)}s`,
    10,
    105
  );
}

