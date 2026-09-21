import { GameConfig } from "../core/config/GameConfig";
import { GameClock } from "../core/time/GameClock";
import { Input } from "../input/Input";
import { Player } from "../entities/Player";
import { Level } from "../world/level/Level";
import { Renderer } from "../rendering/Renderer";

export class Game {
  private readonly clock = new GameClock();
  private readonly input: Input;
  private readonly level: Level;
  private readonly player: Player;
  private readonly renderer: Renderer;
  private lastFrameTime = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.input = new Input(canvas);
    this.level = new Level();
    this.player = new Player(this.level.spawn.x, this.level.spawn.y);
    this.renderer = new Renderer(canvas);
  }

  start(): void {
    requestAnimationFrame(t => this.loop(t));
  }

  private loop(time: number): void {
    const dt = this.clock.deltaSeconds(
      time,
      1 / 30
    );

    this.input.update();
    this.player.update(dt, this.input, this.level);
    for (const sheep of this.level.sheep) {
      sheep.update(dt);
    }
    this.renderer.render(this.level, this.player);

    this.lastFrameTime = time;
    requestAnimationFrame(t => this.loop(t));
  }
}
