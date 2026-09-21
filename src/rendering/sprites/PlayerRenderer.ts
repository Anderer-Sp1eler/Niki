import type { Player } from "../../entities/Player";
import { SpriteSheet, type PlayerAnimation } from "./SpriteSheet";

/**
 * Wolfy Renderer.
 *
 * Der technische Frame ist immer 128x128.
 * Der Wolf wird im Spiel mit 96x96 gezeichnet.
 *
 * Der Weltanker liegt an der Unterkante der Physikbox.
 */
export class PlayerRenderer {
  private readonly sprites = new SpriteSheet();

  private lastAnimation: PlayerAnimation | null = null;
  private lastTime = performance.now();

  private readonly spriteWidth = 96;
  private readonly spriteHeight = 96;

  draw(ctx: CanvasRenderingContext2D, player: Player): void {
    const now = performance.now();
    const deltaTime = Math.min(
      Math.max(0, (now - this.lastTime) / 1000),
      0.05
    );
    this.lastTime = now;

    const animation = this.getAnimation(player);

    if (animation !== this.lastAnimation) {
      this.sprites.setAnimation(animation);
      this.lastAnimation = animation;
    }

    this.sprites.update(deltaTime);

    const playerCenterX = player.x + player.width / 2;
    const playerBottom = player.y + player.height;

    const x = playerCenterX - this.spriteWidth / 2;
    const y = playerBottom - this.spriteHeight;

    this.sprites.draw(
      ctx,
      x,
      y,
      this.spriteWidth,
      this.spriteHeight,
      player.facing === "left"
    );
  }

  private getAnimation(player: Player): PlayerAnimation {
    switch (player.state) {
      case "idle":
        return "idle";
      case "run":
        return "run";
      case "jump":
        return "jump";
      case "fall":
        return "fall";
      case "land":
        return "land";
      case "hurt":
        return "hurt";
      case "death":
        return "death";
      default:
        return "idle";
    }
  }
}
