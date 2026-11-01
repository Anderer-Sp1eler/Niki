import { Game } from "./game/Game";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) throw new Error("Canvas #game wurde nicht gefunden.");

new Game(canvas).start();
