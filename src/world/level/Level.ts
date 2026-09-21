import { GameConfig } from "../../core/config/GameConfig";
import { Sheep } from "../../entities/Sheep";

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay?: boolean;
}

export class Level {
  readonly width = GameConfig.world.levelWidth;
  readonly height = GameConfig.world.levelHeight;
  readonly spawn = { x: 120, y: 300 };

  readonly platforms: Platform[] = [
    { x: 0, y: 500, width: 3200, height: 100 },
    { x: 300, y: 410, width: 180, height: 24 },
    { x: 620, y: 350, width: 190, height: 24 },
    { x: 960, y: 290, width: 180, height: 24, oneWay: true },
    { x: 1300, y: 390, width: 220, height: 24 },
    { x: 1700, y: 320, width: 180, height: 24, oneWay: true },
    { x: 2050, y: 250, width: 180, height: 24 },
    { x: 2450, y: 370, width: 220, height: 24 },
    { x: 2850, y: 300, width: 180, height: 24, oneWay: true }
  ];

  // Erstes Gegner-Exemplar: patrouilliert auf dem Boden zwischen x=600 und x=900.
  readonly sheep: Sheep[] = [
    new Sheep(720, 500, 600, 900)
  ];
}
