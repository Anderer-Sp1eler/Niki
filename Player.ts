import { GameConfig } from "../core/config/GameConfig";
import { Input } from "../input/Input";
import { Level } from "../world/level/Level";
import { CollisionSystem } from "../world/collision/CollisionSystem";

export type PlayerState =
  | "idle"
  | "run"
  | "jump"
  | "fall"
  | "land"
  | "hurt"
  | "death";

export class Player {
  readonly width = GameConfig.player.width;
  readonly height = GameConfig.player.height;

  // Lebenspunkte für die spätere Gegner-/Schadenslogik.
  readonly maxHealth = 3;
  health = this.maxHealth;

  vx = 0;
  vy = 0;
  grounded = false;
  facing: "left" | "right" = "right";

  state: PlayerState = "fall";
  animationTime = 0;

  private coyoteTimer = 0;
  private jumpBufferTimer = 0;

  // Timer für Zustände, die eine eigene Animation besitzen.
  private landTimer = 0;
  private hurtTimer = 0;
  private deathTimer = 0;

  private readonly landDuration = 0.28;
  private readonly hurtDuration = 0.42;
  private readonly deathDuration = 0.60;

  constructor(
    public x: number,
    public y: number,
    private readonly collision = new CollisionSystem()
  ) {}

  update(dt: number, input: Input, level: Level): void {
    /*
     * DEATH:
     * Während der Death-Animation wird keine normale Steuerung mehr
     * ausgeführt. Nach Ende der Animation wird Wolfy respawnt.
     */
    if (this.state === "death") {
      this.animationTime += dt;
      this.deathTimer -= dt;

      if (this.deathTimer <= 0) {
        this.respawn(level);
      }

      return;
    }

    /*
     * HURT:
     * Wolfy kann während der Hurt-Animation nicht normal gesteuert werden.
     * Danach geht es abhängig von der Physik mit jump/fall/idle weiter.
     */
    if (this.state === "hurt") {
      this.animationTime += dt;
      this.hurtTimer -= dt;

      // Während des Treffers etwas Bewegung zulassen.
      this.vy = Math.min(
        this.vy + GameConfig.physics.gravity * dt,
        GameConfig.physics.maxFallSpeed
      );

      const previousBottom = this.y + this.height;

      this.x += this.vx * dt;
      this.collision.resolveHorizontal(this, level.platforms);

      this.y += this.vy * dt;
      this.collision.resolveVertical(
        this,
        level.platforms,
        previousBottom
      );

      if (this.hurtTimer <= 0) {
        this.updateMovementStateAfterSpecialState();
      }

      return;
    }

    /*
     * LAND:
     * Die Land-Animation wird nur kurz abgespielt. Danach entscheidet
     * die normale Bewegungslogik automatisch zwischen idle und run.
     */
    if (this.state === "land") {
      this.animationTime += dt;
      this.landTimer -= dt;

      // Während der Landung bremsen wir Wolfy etwas ab.
      this.vx = moveTowards(
        this.vx,
        0,
        GameConfig.physics.friction * dt
      );

      if (this.landTimer <= 0) {
        this.updateMovementStateAfterSpecialState();
      }

      // Landen soll nicht von der normalen Jump/Fall-Logik überschrieben werden.
      return;
    }

    const p = GameConfig.physics;

    // Coyote Time
    if (this.grounded) {
      this.coyoteTimer = p.coyoteTime;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump Buffer
    if (input.jumpPressed) {
      this.jumpBufferTimer = p.jumpBufferTime;
    } else {
      this.jumpBufferTimer = Math.max(
        0,
        this.jumpBufferTimer - dt
      );
    }

    const direction =
      (input.right ? 1 : 0) -
      (input.left ? 1 : 0);

    if (direction !== 0) {
      this.facing = direction > 0 ? "right" : "left";

      const acceleration = this.grounded
        ? p.acceleration
        : p.airAcceleration;

      this.vx = moveTowards(
        this.vx,
        direction * p.moveSpeed,
        acceleration * dt
      );
    } else {
      this.vx = moveTowards(
        this.vx,
        0,
        p.friction * dt
      );
    }

    // Springen
    if (
      this.jumpBufferTimer > 0 &&
      this.coyoteTimer > 0
    ) {
      this.vy = -p.jumpSpeed;
      this.grounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }

    const wasGrounded = this.grounded;
    const previousBottom = this.y + this.height;

    // Gravitation
    this.vy = Math.min(
      this.vy + p.gravity * dt,
      p.maxFallSpeed
    );

    // Horizontale Bewegung
    this.x += this.vx * dt;
    this.collision.resolveHorizontal(
      this,
      level.platforms
    );

    // Vertikale Bewegung
    this.y += this.vy * dt;
    this.collision.resolveVertical(
      this,
      level.platforms,
      previousBottom
    );

    this.x = Math.max(
      0,
      Math.min(
        this.x,
        level.width - this.width
      )
    );

    if (this.y > level.height + 200) {
      this.respawn(level);
      return;
    }

    /*
     * LAND-Erkennung:
     *
     * Vorher waren wir in der Luft und jetzt stehen wir wieder auf
     * einer Plattform. Genau hier startet die Land-Animation.
     */
    if (!wasGrounded && this.grounded && this.vy === 0) {
      this.state = "land";
      this.animationTime = 0;
      this.landTimer = this.landDuration;
      return;
    }

    this.animationTime += dt;
    this.updateState();
  }

  /**
   * Schaden zufügen.
   *
   * Diese Methode wird später beispielsweise von einem Gegner,
   * Projektil oder einer Falle aufgerufen:
   *
   *   player.takeDamage();
   */
  takeDamage(amount = 1): void {
    // Während der Death-Animation kein weiterer Schaden.
    if (this.state === "death") {
      return;
    }

    this.health = Math.max(
      0,
      this.health - Math.max(1, amount)
    );

    this.animationTime = 0;

    if (this.health <= 0) {
      this.startDeath();
      return;
    }

    this.startHurt();
  }

  /**
   * Death-Zustand explizit auslösen.
   */
  die(): void {
    if (this.state === "death") {
      return;
    }

    this.health = 0;
    this.startDeath();
  }

  private startHurt(): void {
    this.state = "hurt";
    this.hurtTimer = this.hurtDuration;
    this.animationTime = 0;

    // Kleiner Rückstoß beim Treffer.
    this.vy = -180;

    this.vx =
      this.facing === "right"
        ? -90
        : 90;
  }

  private startDeath(): void {
    this.state = "death";
    this.deathTimer = this.deathDuration;
    this.animationTime = 0;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
  }

  private updateState(): void {
    if (!this.grounded) {
      this.state =
        this.vy < 0
          ? "jump"
          : "fall";
    } else if (Math.abs(this.vx) > 15) {
      this.state = "run";
    } else {
      this.state = "idle";
    }
  }

  /**
   * Nach LAND oder HURT wieder in den normalen Bewegungszustand.
   */
  private updateMovementStateAfterSpecialState(): void {
    this.animationTime = 0;

    if (!this.grounded) {
      this.state =
        this.vy < 0
          ? "jump"
          : "fall";
    } else if (Math.abs(this.vx) > 15) {
      this.state = "run";
    } else {
      this.state = "idle";
    }
  }

  private respawn(level: Level): void {
    this.x = level.spawn.x;
    this.y = level.spawn.y;

    this.vx = 0;
    this.vy = 0;

    this.grounded = false;

    this.health = this.maxHealth;

    this.state = "fall";
    this.animationTime = 0;

    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    this.landTimer = 0;
    this.hurtTimer = 0;
    this.deathTimer = 0;
  }
}

function moveTowards(
  current: number,
  target: number,
  amount: number
): number {
  if (current < target) {
    return Math.min(
      current + amount,
      target
    );
  }

  if (current > target) {
    return Math.max(
      current - amount,
      target
    );
  }

  return target;
}
