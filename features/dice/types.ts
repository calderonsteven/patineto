export type Difficulty = 'principiante' | 'intermedio' | 'avanzado';

export type Trick = {
  name: string;
  note: string;
};

export type DiceSet = {
  stance: string[];
  obstacle: string[];
  difficultyWeight: Record<Difficulty, number>;
  tricks: Trick[];
};

export type DiceResult = {
  adaptedDifficulty: Difficulty;
  stance: string;
  obstacle: string;
  trick: Trick;
};

export type DifficultyOption = {
  value: Difficulty;
  label: string;
  hint: string;
};

export type RollDynamics = {
  durationMs: number;
  staggerMs: number;
  baseSpinDeg: number;
  tiltDeg: number;
  shakePx: number;
};
