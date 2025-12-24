import { aabbIntersect } from "./collision";

export function resolveVertical(player, world) {
  player.onGround = false;

  for (const p of world.platforms) {
    const playerBox = {
      x: player.pos.x,
      y: player.pos.y,
      width: player.width,
      height: player.height,
    };

    if (aabbIntersect(playerBox, p)) {
      const playerBottom = player.pos.y + player.height;
      const platformTop = p.y;
      const overlap = playerBottom - platformTop;

      if (player.vel.y > 0) {
        if (overlap <= Math.abs(player.vel.y) * 0.02) {
          player.pos.y = p.y - player.height;
          player.vel.y = 0;
          player.onGround = true;
        }
      }
    }
  }
}
