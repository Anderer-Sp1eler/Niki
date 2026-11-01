import type { Bear, BearState } from "../../entities/Bear";

type AnimationDefinition = {
    count: number;
    frameDuration: number;
    loop: boolean;
};

const ANIMATIONS: Record<BearState, AnimationDefinition> = {
    idle: { count: 6, frameDuration: 0.30, loop: true },
    walk: { count: 10, frameDuration: 0.08, loop: true },
    attack: { count: 8, frameDuration: 0.14, loop: false },
};

/*
 * Die Sprite-Rahmen haben unterschiedliche Größen.
 * Deshalb wird nicht die Rahmenmitte als Weltanker verwendet.
 *
 * anchorX = horizontale Referenz innerhalb der jeweiligen Animation.
 * anchorY = sichtbare Fußlinie des jeweiligen Frames.
 */
const ANCHOR_X: Record<BearState, number> = {
    idle: 121.5,
    walk: 138.5,
    attack: 139.5,
};

export class BearRenderer {
    private readonly animations = new Map<BearState, HTMLImageElement[]>();

    constructor() {
        this.loadAnimations();
    }

    draw(ctx: CanvasRenderingContext2D, bear: Bear): void {
        const definition = ANIMATIONS[bear.state];
        const frames = this.animations.get(bear.state);

        if (!frames || frames.length === 0) {
            return;
        }

        const rawFrame = Math.floor(
            bear.animationTime / definition.frameDuration
        );

        const frameIndex = definition.loop
            ? rawFrame % definition.count
            : Math.min(rawFrame, definition.count - 1);

        const image = frames[frameIndex];

        if (!image || !image.complete || image.naturalWidth === 0) {
            return;
        }

        /*
         * Die PNGs besitzen unten einen konstanten transparenten Rand.
         * Die sichtbare Fußlinie wird daher mit dem unteren Sprite-Rand
         * minus 5 px auf die Welt-Baseline gelegt.
         */
        const baselineInset = 5;
        const worldCenterX = bear.x + bear.width / 2;
        const worldBottomY = bear.y + bear.height;

        const drawX =
            Math.round(worldCenterX - ANCHOR_X[bear.state]);

        const drawY =
            Math.round(worldBottomY - image.naturalHeight + baselineInset);

        ctx.save();
        ctx.imageSmoothingEnabled = true;

        if (bear.facing === "left") {
            ctx.translate(drawX + image.naturalWidth, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight
            );
        } else {
            ctx.drawImage(
                image,
                drawX,
                drawY,
                image.naturalWidth,
                image.naturalHeight
            );
        }

        ctx.restore();
    }

    private loadAnimations(): void {
        for (const state of Object.keys(ANIMATIONS) as BearState[]) {
            const definition = ANIMATIONS[state];
            const images: HTMLImageElement[] = [];

            for (let i = 0; i < definition.count; i++) {
                const image = new Image();

                image.src =
                    `${import.meta.env.BASE_URL}` +
                    `assets/images/enemy/bear/${state}/` +
                    `${String(i).padStart(2, "0")}.png`;

                image.onerror = () => {
                    console.error(
                        `Bär-Sprite konnte nicht geladen werden: ${image.src}`
                    );
                };

                images.push(image);
            }

            this.animations.set(state, images);
        }
    }
}
