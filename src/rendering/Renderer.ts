import type { Player } from "../entities/Player";
import type { Level } from "../world/level/Level";
import { Camera } from "./camera/Camera";
import { PlayerRenderer } from "./sprites/PlayerRenderer";
import { SheepRenderer } from "./enemies/SheepRenderer";

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly camera = new Camera();
  private readonly playerRenderer = new PlayerRenderer();
  private readonly sheepRenderer = new SheepRenderer();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D Canvas-Kontext nicht verfügbar.");
    this.ctx = ctx;
    this.resize();
    addEventListener("resize", () => this.resize());
  }

  private resize(): void {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(innerWidth * dpr);
    this.canvas.height = Math.floor(innerHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(level: Level, player: Player): void {
    const c = this.ctx;
    const w = innerWidth;
    const h = innerHeight;

    this.camera.follow(player.x, w, level.width);

    c.clearRect(0, 0, w, h);
    c.fillStyle = "#78c8ff";
    c.fillRect(0, 0, w, h);

    // Simple background layers to make camera movement visible.
    c.fillStyle = "#9ad8a4";
    c.fillRect(0, h * 0.55, w, h * 0.45);

    c.save();
    c.translate(-this.camera.x, 0);

    for (const platform of level.platforms) {
      c.fillStyle = platform.oneWay ? "#9b6b43" : "#5b8f3a";
      c.fillRect(platform.x, platform.y, platform.width, platform.height);

      if (platform.oneWay) {
        c.fillStyle = "#c99a67";
        c.fillRect(platform.x, platform.y, platform.width, 5);
      }
    }

    for (const sheep of level.sheep) {
      this.sheepRenderer.draw(c, sheep);
    }

    this.playerRenderer.draw(c, player);
    c.restore();

    c.fillStyle = "#fff";
    c.font = "bold 20px system-ui";
    c.fillText("Jump'n'Run – v0.4", 20, 32);
    c.font = "15px system-ui";
    c.fillText(
      `A/D oder ←/→ · Space/W springen · Zustand: ${player.state}`,
      20,
      57
    );
  }
}
