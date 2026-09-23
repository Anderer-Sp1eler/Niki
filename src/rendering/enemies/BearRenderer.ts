import type { Bear, BearState } from "../../entities/Bear";

type LoadedAnimation = {
  images: HTMLImageElement[];
  frameDuration: number;
};

// Die Angriffsanimation verwendet vier vollständige 128x128-PNG-Frames.
// Alle Frames sind vollständig innerhalb des Spritebereichs und besitzen denselben
// Bodenanker, damit der Bär beim Fuchteln nicht sichtbar springt.
const ANIMATIONS: Record<BearState, { count: number; frameDuration: number }> = {
  idle: { count: 3, frameDuration: 0.42 },
  walk: { count: 4, frameDuration: 0.24 },
  attack: { count: 4, frameDuration: 0.16 },
};

const VISUAL_ANCHORS: Record<BearState, Array<[number, number]>> = {
  idle: [
    [64, 121],
    [64, 121],
    [64, 121],
  ],
  walk: [
    [64, 121],
    [64, 121],
    [64, 121],
    [64, 121],
  ],
  attack: [
    [64, 122],
    [64, 122],
    [64, 122],
    [64, 122],
  ],
};

export class BearRenderer {
  private readonly animations = new Map<BearState, LoadedAnimation>();
  private currentAnimation: BearState = "idle";
  private currentFrame = 0;
  private animationTime = 0;
  private lastTime = performance.now();
  private lastState: BearState = "idle";

  private readonly spriteWidth = 104;
  private readonly spriteHeight = 104;

  constructor() {
    this.loadAnimations();
  }

  draw(ctx: CanvasRenderingContext2D, bear: Bear): void {
    const now = performance.now();
    const dt = Math.min(
      Math.max(0, (now - this.lastTime) / 1000),
      0.05
    );
    this.lastTime = now;

    if (bear.state !== this.lastState) {
      this.currentAnimation = bear.state;
      this.currentFrame = 0;
      this.animationTime = 0;
      this.lastState = bear.state;
    }

    this.animationTime += dt;

    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return;

    while (this.animationTime >= animation.frameDuration) {
      this.animationTime -= animation.frameDuration;
      this.currentFrame =
        (this.currentFrame + 1) % animation.images.length;
    }

    const image = animation.images[this.currentFrame];
    if (!image || !image.complete || image.naturalWidth === 0) return;

    const [sourceCenterX, sourceBottomY] =
      VISUAL_ANCHORS[this.currentAnimation][this.currentFrame];

    const scale = this.spriteWidth / 128;
    const targetCenterX = bear.x + bear.width / 2;
    const targetBottomY = bear.y + bear.height;

    let drawX = Math.round(targetCenterX - sourceCenterX * scale);
    const drawY = Math.round(targetBottomY - sourceBottomY * scale);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Beim Aufrichten leicht hin- und herwackeln, damit die Tatzenbewegung
    // lebendiger wirkt, auch wenn die beiden Angriffssprites alternieren.
    if (bear.state === "attack") {
      const shake = Math.sin(bear.animationTime * 32) * 2.2;
      drawX += Math.round(shake);
    }

    if (bear.facing === "left") {
      const mirroredSourceCenterX = 128 - sourceCenterX;
      const mirroredX = Math.round(
        targetCenterX - mirroredSourceCenterX * scale
      );

      ctx.translate(mirroredX + this.spriteWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        image,
        0,
        0,
        128,
        128,
        0,
        0,
        this.spriteWidth,
        this.spriteHeight
      );
    } else {
      ctx.drawImage(
        image,
        0,
        0,
        128,
        128,
        drawX,
        drawY,
        this.spriteWidth,
        this.spriteHeight
      );
    }

    ctx.restore();
  }

  private loadAnimations(): void {
    for (const [state, definition] of Object.entries(ANIMATIONS) as [
      BearState,
      { count: number; frameDuration: number }
    ][]) {
      const images: HTMLImageElement[] = [];

      for (let i = 0; i < definition.count; i++) {
        const image = new Image();
        const src =
          `${import.meta.env.BASE_URL}assets/images/enemy/bear/${state}/${String(i).padStart(2, "0")}.png`;

        image.onerror = () => {
          console.error(`Bär-Sprite konnte nicht geladen werden: ${src}`);
        };

        image.src = src;
        images.push(image);
      }

      this.animations.set(state, {
        images,
        frameDuration: definition.frameDuration,
      });
    }
  }
}
