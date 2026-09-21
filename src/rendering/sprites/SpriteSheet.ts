/**
 * Wolfy SpriteSheet
 *
 * Verwendet bewusst einzelne 128x128-PNG-Frames statt eines großen
 * horizontalen Sprite-Sheets. Dadurch gibt es keine Möglichkeit, dass
 * die Quell-X-Koordinate eines Frames falsch ist.
 */
export const SPRITE_FRAME_WIDTH = 128;
export const SPRITE_FRAME_HEIGHT = 128;

export type PlayerAnimation =
  | "idle"
  | "run"
  | "jump"
  | "fall"
  | "land"
  | "attack"
  | "hurt"
  | "death";

type AnimationDefinition = {
  frames: string[];
  frameDuration: number;
  loop: boolean;
};

const framePaths = (
  animation: PlayerAnimation,
  count: number
): string[] =>
  Array.from(
    { length: count },
    (_, i) =>
      `${import.meta.env.BASE_URL}assets/images/player/frames/${animation}/${String(i).padStart(2, "0")}.png`
  );

export const PLAYER_ANIMATIONS: Record<
  PlayerAnimation,
  AnimationDefinition
> = {
  idle: {
    frames: framePaths("idle", 6),
    frameDuration: 0.16,
    loop: true,
  },
  run: {
    frames: framePaths("run", 8),
    frameDuration: 0.09,
    loop: true,
  },
  jump: {
    frames: framePaths("jump", 4),
    frameDuration: 0.10,
    loop: false,
  },
  fall: {
    frames: framePaths("fall", 4),
    frameDuration: 0.10,
    loop: true,
  },
  land: {
    frames: framePaths("land", 4),
    frameDuration: 0.08,
    loop: false,
  },
  attack: {
    frames: framePaths("attack", 4),
    frameDuration: 0.08,
    loop: false,
  },
  hurt: {
    frames: framePaths("hurt", 4),
    frameDuration: 0.10,
    loop: false,
  },
  death: {
    frames: framePaths("death", 4),
    frameDuration: 0.12,
    loop: false,
  },
};

type LoadedAnimation = {
  images: HTMLImageElement[];
  frameDuration: number;
  loop: boolean;
};

export class SpriteSheet {
  private readonly animations = new Map<
    PlayerAnimation,
    LoadedAnimation
  >();

  private currentAnimation: PlayerAnimation = "idle";
  private currentFrame = 0;
  private animationTime = 0;

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    for (const [name, definition] of Object.entries(
      PLAYER_ANIMATIONS
    ) as [PlayerAnimation, AnimationDefinition][]) {
      const images: HTMLImageElement[] = [];

      for (const src of definition.frames) {
        const image = new Image();

        image.onload = () => {
          if (
            image.naturalWidth !== SPRITE_FRAME_WIDTH ||
            image.naturalHeight !== SPRITE_FRAME_HEIGHT
          ) {
            console.error(
              `Wolfy Frame ${src} hat nicht 128x128 Pixel, sondern ` +
                `${image.naturalWidth}x${image.naturalHeight}.`
            );
          }
        };

        image.onerror = () => {
          console.error(`Wolfy Frame konnte nicht geladen werden: ${src}`);
        };

        image.src = src;
        images.push(image);
      }

      this.animations.set(name, {
        images,
        frameDuration: definition.frameDuration,
        loop: definition.loop,
      });
    }
  }

  setAnimation(animation: PlayerAnimation): void {
    if (this.currentAnimation === animation) {
      return;
    }

    this.currentAnimation = animation;
    this.currentFrame = 0;
    this.animationTime = 0;
  }

  update(deltaTime: number): void {
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return;

    this.animationTime += Math.max(0, Math.min(deltaTime, 0.05));

    while (this.animationTime >= animation.frameDuration) {
      this.animationTime -= animation.frameDuration;

      if (this.currentFrame < animation.images.length - 1) {
        this.currentFrame++;
      } else if (animation.loop) {
        this.currentFrame = 0;
      } else {
        this.currentFrame = animation.images.length - 1;
        this.animationTime = 0;
        break;
      }
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width = SPRITE_FRAME_WIDTH,
    height = SPRITE_FRAME_HEIGHT,
    flipX = false
  ): void {
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return;

    const image = animation.images[this.currentFrame];

    if (!image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    // Weltposition immer auf ganze Pixel runden.
    const drawX = Math.round(x);
    const drawY = Math.round(y);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (flipX) {
      ctx.translate(drawX + width, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        image,
        0,
        0,
        SPRITE_FRAME_WIDTH,
        SPRITE_FRAME_HEIGHT,
        0,
        0,
        width,
        height
      );
    } else {
      ctx.drawImage(
        image,
        0,
        0,
        SPRITE_FRAME_WIDTH,
        SPRITE_FRAME_HEIGHT,
        drawX,
        drawY,
        width,
        height
      );
    }

    ctx.restore();
  }

  getCurrentAnimation(): PlayerAnimation {
    return this.currentAnimation;
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  isAnimationFinished(): boolean {
    const animation = this.animations.get(this.currentAnimation);
    return Boolean(
      animation &&
        !animation.loop &&
        this.currentFrame >= animation.images.length - 1
    );
  }
}
