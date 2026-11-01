export const GameConfig = {
  physics: {
    gravity: 1650,
    moveSpeed: 300,
    acceleration: 2200,
    airAcceleration: 1500,
    friction: 2600,
    jumpSpeed: 590,
    maxFallSpeed: 900,
    coyoteTime: 0.10,
    jumpBufferTime: 0.12
  },
  world: {
    levelWidth: 3200,
    levelHeight: 600
  },
  player: {
    width: 42,
    height: 58
  }
} as const;
