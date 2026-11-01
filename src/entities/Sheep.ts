export type SheepState = "idle" | "walk";

export class Sheep {
  readonly width = 40;
  readonly height = 48;
  x: number;
  readonly y: number;
  vx = 0;
  facing: "left" | "right" = "right";
  state: SheepState = "idle";
  animationTime = 0;

  private readonly patrolLeft: number;
  private readonly patrolRight: number;
  private waitTimer = 1.5;
  private walkTimer = 0;

  private readonly walkSpeed = 55;
  private readonly minWait = 1.0;
  private readonly maxWait = 2.8;
  private readonly minWalk = 1.8;
  private readonly maxWalk = 4.0;

  constructor(
    x: number,
    private readonly platformY: number,
    patrolLeft: number,
    patrolRight: number
  ) {
    this.x = x;
    this.y = platformY - this.height;
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
  }

  update(dt: number): void {
    this.animationTime += dt;

    if (this.state === "idle") {
      this.vx = 0;
      this.waitTimer -= dt;

      if (this.waitTimer <= 0) {
        this.state = "walk";
        this.walkTimer = randomBetween(this.minWalk, this.maxWalk);

        if (this.x <= this.patrolLeft + 2) {
          this.facing = "right";
        } else if (this.x >= this.patrolRight - 2) {
          this.facing = "left";
        } else {
          this.facing = Math.random() < 0.5 ? "left" : "right";
        }
      }
      return;
    }

    this.vx = this.facing === "right" ? this.walkSpeed : -this.walkSpeed;
    this.x += this.vx * dt;
    this.walkTimer -= dt;

    if (this.x >= this.patrolRight) {
      this.x = this.patrolRight;
      this.facing = "left";
      this.startWaiting();
    } else if (this.x <= this.patrolLeft) {
      this.x = this.patrolLeft;
      this.facing = "right";
      this.startWaiting();
    } else if (this.walkTimer <= 0) {
      this.startWaiting();
    }
  }

  private startWaiting(): void {
    this.state = "idle";
    this.vx = 0;
    this.animationTime = 0;
    this.waitTimer = randomBetween(this.minWait, this.maxWait);
  }
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
