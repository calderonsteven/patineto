import { NO_OBSTACLE_LABEL, trickPools } from '@/features/dice/config';
import { DiceResult, Difficulty, RollDynamics } from '@/features/dice/types';

export function randomFrom<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickDifficulty(baseDifficulty: Difficulty): Difficulty {
  const weights = trickPools[baseDifficulty].difficultyWeight;
  const roll = Math.random();
  let cumulative = 0;

  const order: Difficulty[] = ['principiante', 'intermedio', 'avanzado'];
  for (const difficulty of order) {
    cumulative += weights[difficulty];
    if (roll <= cumulative) {
      return difficulty;
    }
  }

  return baseDifficulty;
}

export function adaptDynamicsForViewport(dynamics: RollDynamics) {
  if (typeof window === 'undefined' || window.innerWidth >= 640) {
    return dynamics;
  }

  return {
    durationMs: Math.max(1350, dynamics.durationMs - 180),
    staggerMs: Math.max(70, dynamics.staggerMs - 25),
    baseSpinDeg: Math.max(1080, dynamics.baseSpinDeg - 220),
    tiltDeg: Math.max(9, dynamics.tiltDeg - 3),
    shakePx: Math.max(4, dynamics.shakePx - 2),
  };
}

export function buildRollDynamics(): RollDynamics {
  return {
    durationMs: randomInt(1500, 1800),
    staggerMs: randomInt(90, 130),
    baseSpinDeg: randomInt(1260, 1980),
    tiltDeg: randomInt(12, 20),
    shakePx: randomInt(6, 9),
  };
}

export function buildFinalResult(selectedDifficulty: Difficulty, includeObstacle: boolean): DiceResult {
  const adaptedDifficulty = pickDifficulty(selectedDifficulty);
  const pool = trickPools[adaptedDifficulty];

  return {
    adaptedDifficulty,
    stance: randomFrom(pool.stance),
    obstacle: includeObstacle ? randomFrom(pool.obstacle) : NO_OBSTACLE_LABEL,
    trick: randomFrom(pool.tricks),
  };
}

export function buildResultQuery(result: DiceResult | null) {
  if (!result) {
    return '';
  }

  return [result.stance, result.obstacle !== NO_OBSTACLE_LABEL ? result.obstacle : null, result.trick.name, 'skate trick']
    .filter(Boolean)
    .join(' ');
}
