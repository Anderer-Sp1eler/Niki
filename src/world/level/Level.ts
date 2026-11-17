import { GameConfig } from "../../core/config/GameConfig";
import { Sheep } from "../../entities/Sheep";
import { Bear } from "../../entities/Bear";

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay?: boolean;
  /** Bewegungsbereich und Geschwindigkeit einer horizontalen Plattform. */
  moving?: {
    minX: number;
    maxX: number;
    speed: number;
    direction: 1 | -1;
  };
  /** Zur Mitnahme des Spielers benötigte Positionsänderung pro Update. */
  deltaX?: number;
}

export class Level {
  readonly width = GameConfig.world.levelWidth;
  readonly height = GameConfig.world.levelHeight;
  readonly spawn = { x: 120, y: 300 };

  readonly platforms: Platform[] = [
    { x: 0, y: 500, width: 3200, height: 100 },
    { x: 300, y: 410, width: 180, height: 24 },
    { x: 620, y: 350, width: 190, height: 24 },
    // Bewegliche Plattform: pendelt zwischen x=820 und x=930.
    {
      x: 820, y: 430, width: 150, height: 22, oneWay: true,
      moving: { minX: 820, maxX: 930, speed: 85, direction: 1 }
    },
    { x: 960, y: 290, width: 180, height: 24, oneWay: true },
    { x: 1300, y: 390, width: 220, height: 24 },
    { x: 1700, y: 320, width: 180, height: 24, oneWay: true },
    // Zweite bewegliche Plattform für den späteren Levelabschnitt.
    {
      x: 1880, y: 410, width: 160, height: 22, oneWay: true,
      moving: { minX: 1880, maxX: 2010, speed: 105, direction: -1 }
    },
    { x: 2050, y: 250, width: 180, height: 24 },
    { x: 2450, y: 370, width: 220, height: 24 },
    { x: 2850, y: 300, width: 180, height: 24, oneWay: true }
  ];

  /**
   * Bewegt alle dynamischen Plattformen. Steht der Spieler zu Beginn
   * des Updates auf einer solchen Plattform, wird er um exakt dieselbe
   * horizontale Strecke mitgenommen.
   */
  update(dt: number, rider: {
    x: number;
    y: number;
    width: number;
    height: number;
    grounded: boolean;
  }): void {
    for (const platform of this.platforms) {
      platform.deltaX = 0;
      const movement = platform.moving;
      if (!movement) continue;

      const riderBottom = rider.y + rider.height;
      const standsOnPlatform =
        rider.grounded &&
        Math.abs(riderBottom - platform.y) <= 3 &&
        rider.x + rider.width > platform.x &&
        rider.x < platform.x + platform.width;

      const oldX = platform.x;
      platform.x += movement.direction * movement.speed * dt;

      if (platform.x <= movement.minX) {
        platform.x = movement.minX;
        movement.direction = 1;
      } else if (platform.x >= movement.maxX) {
        platform.x = movement.maxX;
        movement.direction = -1;
      }

      platform.deltaX = platform.x - oldX;

      if (standsOnPlatform) {
        rider.x += platform.deltaX;
      }
    }
  }

  // Erstes Gegner-Exemplar: patrouilliert auf dem Boden zwischen x=600 und x=900.
  readonly sheep: Sheep[] = [
    new Sheep(720, 500, 600, 900)
  ];

  // Zweites Gegner-Exemplar: langsam und schwerfällig auf dem Boden.
  readonly bears: Bear[] = [
    new Bear(2200, 500, 1950, 2350)
  ];
}
