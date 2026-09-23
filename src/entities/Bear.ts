import type { Player } from "./Player";

export type BearState = "idle" | "walk" | "attack";

export class Bear {
  // Physikbox bewusst kleiner als das sichtbare Sprite.
  readonly width = 64;
  readonly height = 76;

  x: number;
  readonly y: number;
  vx = 0;
  facing: "left" | "right" = "left";
  state: BearState = "idle";
  animationTime = 0;

  private readonly patrolLeft: number;
  private readonly patrolRight: number;

  private waitTimer = 1.8;
  private walkTimer = 0;
  private attackTimer = 0;
  private attackCooldown = 0;

  // Der Bär bewegt sich bewusst deutlich langsamer und schwerfälliger als Wolfy.
  private readonly walkSpeed = 34;
  private readonly minWait = 1.2;
  private readonly maxWait = 3.2;
  private readonly minWalk = 2.2;
  private readonly maxWalk = 4.8;

  private readonly detectionDistance = 175;
  private readonly attackDuration = 1.15;
  private readonly attackCooldownDuration = 1.5;

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

  update(dt: number, player: Player): void {
    this.animationTime += dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    const playerCenter = player.x + player.width / 2;
    const bearCenter = this.x + this.width / 2;
    const distance = Math.abs(playerCenter - bearCenter);
    const verticallyClose = Math.abs(
      player.y + player.height - this.platformY
    ) < 105;

    // Bei unmittelbarer Nähe richtet sich der Bär auf und fuchtelt mit den Tatzen.
    if (
      this.state !== "attack" &&
      this.attackCooldown <= 0 &&
      distance <= this.detectionDistance &&
      verticallyClose
    ) {
      this.startAttack(playerCenter);
      return;
    }

    if (this.state === "attack") {
      this.vx = 0;
      this.attackTimer -= dt;

      // Während des Angriffs bleibt der Bär stehen und macht seine Drohbewegung.
      if (this.attackTimer <= 0) {
        this.attackCooldown = this.attackCooldownDuration;
        this.startWaiting();
      }
      return;
    }

    if (this.state === "idle") {
      this.vx = 0;
      this.waitTimer -= dt;

      if (this.waitTimer <= 0) {
        this.state = "walk";
        this.walkTimer = randomBetween(
          this.minWalk,
          this.maxWalk
        );

        this.chooseWalkDirection();
      }
      return;
    }

    // Schwerfällige Patrouille.
    this.vx = this.facing === "right"
      ? this.walkSpeed
      : -this.walkSpeed;

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

  private startAttack(playerCenter: number): void {
    this.state = "attack";
    this.animationTime = 0;
    this.attackTimer = this.attackDuration;
    this.vx = 0;
    this.facing = playerCenter >= this.x + this.width / 2
      ? "right"
      : "left";
  }

  private startWaiting(): void {
    this.state = "idle";
    this.vx = 0;
    this.animationTime = 0;
    this.waitTimer = randomBetween(
      this.minWait,
      this.maxWait
    );
  }

  private chooseWalkDirection(): void {
    if (this.x <= this.patrolLeft + 2) {
      this.facing = "right";
    } else if (this.x >= this.patrolRight - 2) {
      this.facing = "left";
    } else {
      this.facing = Math.random() < 0.5 ? "left" : "right";
    }
  }
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
