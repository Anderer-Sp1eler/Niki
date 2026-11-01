export class Camera {
  x = 0;
  y = 0;

  follow(targetX: number, viewportWidth: number, worldWidth: number): void {
    const desired = targetX - viewportWidth * 0.35;
    this.x = Math.max(0, Math.min(desired, Math.max(0, worldWidth - viewportWidth)));
  }
}
