import type { Sheep, SheepState } from "../../entities/Sheep";

type LoadedAnimation = {
  images: HTMLImageElement[];
  frameDuration: number;
};

const ANIMATIONS: Record<
  SheepState,
  { count: number; frameDuration: number }
> = {
  idle: { count: 6, frameDuration: 0.16 },
  walk: { count: 6, frameDuration: 0.11 },
};

// Sichtbarer Mittelpunkt und sichtbare Unterkante der erzeugten 128x128-Sprites.
const VISUAL_ANCHORS: Record<SheepState, Array<[number, number]>> = {
  idle: [
    [63.5, 120],
    [64.5, 120],
    [64.0, 120],
    [64.0, 120],
    [63.5, 120],
    [63.5, 120],
  ],
  walk: [
    [64.0, 120],
    [64.0, 120],
    [64.0, 120],
    [64.5, 120],
    [64.0, 120],
    [63.5, 120],
  ],
};

export class SheepRenderer {
  private readonly animations = new Map<
    SheepState,
    LoadedAnimation
  >();

  private currentAnimation: SheepState = "idle";
  private currentFrame = 0;
  private animationTime = 0;
  private lastTime = performance.now();
  private lastState: SheepState = "idle";

  // Physikbox und Spritegröße sind bewusst getrennt.
  private readonly spriteWidth = 72;
  private readonly spriteHeight = 72;

  constructor() {
    this.loadAnimations();
  }

  draw(ctx: CanvasRenderingContext2D, sheep: Sheep): void {
    const now = performance.now();

    const dt = Math.min(
      Math.max(0, (now - this.lastTime) / 1000),
      0.05
    );

    this.lastTime = now;

    if (sheep.state !== this.lastState) {
      this.currentAnimation = sheep.state;
      this.currentFrame = 0;
      this.animationTime = 0;
      this.lastState = sheep.state;
    }

    this.animationTime += dt;

    const animation = this.animations.get(this.currentAnimation);

    if (!animation) {
      return;
    }

    while (this.animationTime >= animation.frameDuration) {
      this.animationTime -= animation.frameDuration;

      this.currentFrame =
        (this.currentFrame + 1) % animation.images.length;
    }

    const image = animation.images[this.currentFrame];

    if (!image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    const [sourceCenterX, sourceBottomY] =
      VISUAL_ANCHORS[this.currentAnimation][this.currentFrame];

    const scale = this.spriteWidth / 128;

    // Physikbox-Mittelpunkt = visueller Mittelpunkt des Schafes.
    const targetCenterX =
      sheep.x + sheep.width / 2;

    const drawX = Math.round(
      targetCenterX - sourceCenterX * scale
    );

    // Sichtbare Unterkante exakt auf der Plattform.
    const targetBottomY =
      sheep.y + sheep.height;

    const drawY = Math.round(
      targetBottomY - sourceBottomY * scale
    );

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (sheep.facing === "left") {
      const mirroredSourceCenterX =
        128 - sourceCenterX;

      const mirroredX = Math.round(
        targetCenterX -
          mirroredSourceCenterX * scale
      );

      ctx.translate(
        mirroredX + this.spriteWidth,
        drawY
      );

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
    for (const [
      state,
      definition,
    ] of Object.entries(ANIMATIONS) as [
      SheepState,
      { count: number; frameDuration: number }
    ][]) {
      const images: HTMLImageElement[] = [];

      for (let i = 0; i < definition.count; i++) {
        const image = new Image();

        const src =
          `${import.meta.env.BASE_URL}assets/images/enemy/sheep_white/${state}/${String(i).padStart(2, "0")}.png`;

        image.onload = () => {
          if (
            image.naturalWidth !== 128 ||
            image.naturalHeight !== 128
          ) {
            console.error(
              `Schaf-Sprite ${src} ist nicht 128x128: ` +
                `${image.naturalWidth}x${image.naturalHeight}`
            );
          }
        };

        image.onerror = () => {
          console.error(
            `Schaf-Sprite konnte nicht geladen werden: ${src}`
          );
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