export const keys = {
  left: false,
  right: false,
  jump: false,
  shoot: false,
};

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "Space") keys.jump = true;
  if (e.code === "KeyZ") keys.shoot = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "Space") keys.jump = false;
  if (e.code === "KeyZ") keys.shoot = false;
});

