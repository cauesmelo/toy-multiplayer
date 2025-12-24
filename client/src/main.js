import { Game } from "./game/Game";

const canvas = document.querySelector("canvas");
const game = new Game(canvas);

game.start();
