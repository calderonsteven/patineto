import { DiceSet, Difficulty, DifficultyOption, RollDynamics } from '@/features/dice/types';

export const NO_OBSTACLE_LABEL = 'Sin obstáculo';

export const trickPools: Record<Difficulty, DiceSet> = {
  principiante: {
    stance: ['Regular', 'Fakie'],
    obstacle: ['Flat', 'Manual pad', 'Bordillo bajo'],
    difficultyWeight: {
      principiante: 0.8,
      intermedio: 0.2,
      avanzado: 0,
    },
    tricks: [
      { name: 'Ollie', note: 'Busca control y caída estable.' },
      { name: 'Pop Shove-it', note: 'Mantén los hombros rectos.' },
      { name: 'Frontside 180', note: 'Gira con la mirada.' },
      { name: 'Backside 180', note: 'Aterriza con peso centrado.' },
      { name: 'Manual corto', note: 'Sostén 2-3 segundos.' },
      { name: 'Nollie', note: 'Explosión rápida con pie delantero.' },
    ],
  },
  intermedio: {
    stance: ['Regular', 'Fakie', 'Switch'],
    obstacle: ['Flat', 'Bordillo', 'Escalón de 2-3', 'Manual pad'],
    difficultyWeight: {
      principiante: 0.25,
      intermedio: 0.6,
      avanzado: 0.15,
    },
    tricks: [
      { name: 'Kickflip', note: 'Asegura flick limpio y captura con ambos pies.' },
      { name: 'Heelflip', note: 'Rodilla abierta y flick diagonal.' },
      { name: 'Varial Kickflip', note: 'Combina scoop y flick en un solo tiempo.' },
      { name: 'Frontside Pop Shove-it', note: 'Mantén tabla pegada al cuerpo.' },
      { name: 'Nose Manual', note: 'Activa core para no perder línea.' },
      { name: 'Half Cab', note: 'En fakie, gira con salida fluida.' },
    ],
  },
  avanzado: {
    stance: ['Regular', 'Fakie', 'Switch', 'Nollie'],
    obstacle: ['Flat', 'Hubba corta', 'Handrail baja', 'Escalón de 4-6', 'Quarter pipe'],
    difficultyWeight: {
      principiante: 0.1,
      intermedio: 0.3,
      avanzado: 0.6,
    },
    tricks: [
      { name: 'Tre Flip (360 Flip)', note: 'Scoop potente + flick controlado.' },
      { name: 'Hardflip', note: 'Eleva rodillas para evitar toque de tabla.' },
      { name: 'Inward Heelflip', note: 'Coordina scoop inward y heel flick.' },
      { name: 'Laser Flip', note: 'Compromiso completo al giro.' },
      { name: 'Bigspin', note: 'Tronco y tabla en sincronía.' },
      { name: 'Nollie Heel', note: 'Pop rápido y caída con hombros alineados.' },
    ],
  },
};

export const difficulties: DifficultyOption[] = [
  { value: 'principiante', label: 'Principiante', hint: 'Más control y fundamentos' },
  { value: 'intermedio', label: 'Intermedio', hint: 'Flip tricks y rotaciones mixtas' },
  { value: 'avanzado', label: 'Avanzado', hint: 'Combinaciones técnicas y más riesgo' },
];

export const defaultRollDynamics: RollDynamics = {
  durationMs: 1650,
  staggerMs: 110,
  baseSpinDeg: 1620,
  tiltDeg: 16,
  shakePx: 7,
};

export const tileLabels = ['Postura', 'Obstáculo', 'Truco'] as const;
