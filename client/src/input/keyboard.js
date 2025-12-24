export const keys = {
  left: false,
  right: false,
  jump: false,
  shoot: false,
  escape: false,
};

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "ArrowUp") keys.jump = true;
  if (e.code === "KeyZ") keys.shoot = true;
  if (e.code === "Escape") keys.escape = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "ArrowUp") keys.jump = false;
  if (e.code === "KeyZ") keys.shoot = false;
  if (e.code === "Escape") keys.escape = false;
});
