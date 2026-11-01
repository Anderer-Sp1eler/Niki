export class Input {
  private readonly keys = new Set<string>();
  private touchLeft = false;
  private touchRight = false;
  private touchJump = false;
  private previousJumpDown = false;

  left = false;
  right = false;
  jumpPressed = false;

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", e => {
      this.keys.add(e.code);
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", e => this.keys.delete(e.code));

    canvas.addEventListener("pointerdown", e => {
      const leftSide = e.clientX < innerWidth / 2;
      this.touchLeft = leftSide;
      this.touchRight = !leftSide;
      this.touchJump = e.clientY < innerHeight * 0.55;
    });

    const release = () => {
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJump = false;
    };

    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("pointerleave", release);
  }

  update(): void {
    this.left =
      this.touchLeft ||
      this.keys.has("ArrowLeft") ||
      this.keys.has("KeyA");

    this.right =
      this.touchRight ||
      this.keys.has("ArrowRight") ||
      this.keys.has("KeyD");

    const jumpDown =
      this.touchJump ||
      this.keys.has("Space") ||
      this.keys.has("ArrowUp") ||
      this.keys.has("KeyW");

    this.jumpPressed = jumpDown && !this.previousJumpDown;
    this.previousJumpDown = jumpDown;
  }
}
