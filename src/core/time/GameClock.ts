export class GameClock {
  private last = 0;

  deltaSeconds(time: number, maxDelta: number): number {
    const dt = this.last === 0 ? 0 : (time - this.last) / 1000;
    this.last = time;
    return Math.min(dt, maxDelta);
  }
}
