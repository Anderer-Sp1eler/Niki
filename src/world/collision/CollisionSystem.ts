import { horizontalOverlap } from "./Collision";
import type { Platform } from "../level/Level";
import type { Player } from "../../entities/Player";

export class CollisionSystem {
  resolveHorizontal(player: Player, platforms: readonly Platform[]): void {
    for (const platform of platforms) {
      if (
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y < platform.y + platform.height &&
        player.y + player.height > platform.y
      ) {
        if (player.vx > 0) {
          player.x = platform.x - player.width;
        } else if (player.vx < 0) {
          player.x = platform.x + platform.width;
        }
        player.vx = 0;
      }
    }
  }

  resolveVertical(
    player: Player,
    platforms: readonly Platform[],
    previousBottom: number
  ): void {
    player.grounded = false;

    for (const platform of platforms) {
      if (!horizontalOverlap(player, platform)) continue;

      const playerBottom = player.y + player.height;
      const wasAbove = previousBottom <= platform.y + 1;
      const crossingTop = playerBottom >= platform.y && playerBottom <= platform.y + 18;

      // One-way platforms only collide while falling from above.
      if (platform.oneWay && !(player.vy >= 0 && wasAbove && crossingTop)) {
        continue;
      }

      if (player.vy >= 0 && wasAbove && crossingTop) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.grounded = true;
      } else if (
        !platform.oneWay &&
        player.vy < 0 &&
        player.y <= platform.y + platform.height &&
        player.y + player.height > platform.y + platform.height
      ) {
        player.y = platform.y + platform.height;
        player.vy = 0;
      }
    }
  }
}
