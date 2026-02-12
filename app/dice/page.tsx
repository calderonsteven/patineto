'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type Difficulty = 'principiante' | 'intermedio' | 'avanzado';

type Trick = {
  name: string;
  note: string;
};

type DiceSet = {
  stance: string[];
  obstacle: string[];
  difficultyWeight: Record<Difficulty, number>;
  tricks: Trick[];
};

type DiceResult = {
  adaptedDifficulty: Difficulty;
  stance: string;
  obstacle: string;
  trick: Trick;
};

const NO_OBSTACLE_LABEL = 'Sin obstáculo';

type RollDynamics = {
  durationMs: number;
  staggerMs: number;
  baseSpinDeg: number;
  tiltDeg: number;
  shakePx: number;
};

function adaptDynamicsForViewport(dynamics: RollDynamics) {
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

const trickPools: Record<Difficulty, DiceSet> = {
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

const difficulties: { value: Difficulty; label: string; hint: string }[] = [
  { value: 'principiante', label: 'Principiante', hint: 'Más control y fundamentos' },
  { value: 'intermedio', label: 'Intermedio', hint: 'Flip tricks y rotaciones mixtas' },
  { value: 'avanzado', label: 'Avanzado', hint: 'Combinaciones técnicas y más riesgo' },
];

function randomFrom<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickDifficulty(baseDifficulty: Difficulty): Difficulty {
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

const defaultRollDynamics: RollDynamics = {
  durationMs: 1650,
  staggerMs: 110,
  baseSpinDeg: 1620,
  tiltDeg: 16,
  shakePx: 7,
};

function buildRollDynamics(): RollDynamics {
  return {
    durationMs: randomInt(1500, 1800),
    staggerMs: randomInt(90, 130),
    baseSpinDeg: randomInt(1260, 1980),
    tiltDeg: randomInt(12, 20),
    shakePx: randomInt(6, 9),
  };
}

export default function DicePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('principiante');
  const [isRolling, setIsRolling] = useState(false);
  const [rollId, setRollId] = useState(0);
  const [includeObstacle, setIncludeObstacle] = useState(false);
  const [dynamics, setDynamics] = useState<RollDynamics>(defaultRollDynamics);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [preview, setPreview] = useState<Omit<DiceResult, 'adaptedDifficulty'> | null>(null);

  const activePool = useMemo(() => trickPools[selectedDifficulty], [selectedDifficulty]);

  const rollDice = () => {
    if (isRolling) {
      return;
    }

    const nextDynamics = adaptDynamicsForViewport(buildRollDynamics());
    const adaptedDifficulty = pickDifficulty(selectedDifficulty);
    const pool = trickPools[adaptedDifficulty];

    const finalResult: DiceResult = {
      adaptedDifficulty,
      stance: randomFrom(pool.stance),
      obstacle: includeObstacle ? randomFrom(pool.obstacle) : NO_OBSTACLE_LABEL,
      trick: randomFrom(pool.tricks),
    };

    setDynamics(nextDynamics);
    setRollId((prev) => prev + 1);
    setIsRolling(true);
    setResult(null);

    const tickInterval = window.setInterval(() => {
      setPreview({
        stance: randomFrom(activePool.stance),
        obstacle: includeObstacle ? randomFrom(activePool.obstacle) : NO_OBSTACLE_LABEL,
        trick: randomFrom(activePool.tricks),
      });
    }, includeObstacle ? 110 : 95);

    window.setTimeout(() => {
      window.clearInterval(tickInterval);
      setResult(finalResult);
      setPreview(null);
      setIsRolling(false);
    }, nextDynamics.durationMs);
  };

  const tileLabels = ['Postura', 'Obstáculo', 'Truco'] as const;

  const showObstacleValue = includeObstacle || isRolling || Boolean(result);
  const resultQuery = result
    ? [result.stance, result.obstacle !== NO_OBSTACLE_LABEL ? result.obstacle : null, result.trick.name, 'skate trick']
        .filter(Boolean)
        .join(' ')
    : '';
  const youtubeSearchUrl = resultQuery
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(resultQuery)}`
    : '';

  return (
    <section className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Módulo</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Juego de Dados</h1>
        <p className="max-w-3xl text-deck-200">
          Elige una dificultad y lanza los dados para generar un reto de skate con postura, obstáculo y truco.
          Ajustamos automáticamente la complejidad para mantener variedad sin romper tu nivel.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-xl border border-deck-700 bg-deck-800 p-4 sm:p-6">
          <h2 className="text-xl font-semibold">1) Selecciona dificultad</h2>
          <div className="mt-4 space-y-3">
            {difficulties.map((difficulty) => (
              <label
                key={difficulty.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-deck-700 bg-deck-900/60 p-3"
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={difficulty.value}
                  checked={selectedDifficulty === difficulty.value}
                  onChange={() => setSelectedDifficulty(difficulty.value)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="block text-sm font-semibold text-white">{difficulty.label}</span>
                  <span className="text-xs text-deck-200">{difficulty.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-deck-700 bg-deck-900/60 p-4 text-sm text-deck-200">
            <p className="font-semibold text-white">Banco actual ({selectedDifficulty})</p>
            <p className="mt-2">Trucos disponibles: {activePool.tricks.map((trick) => trick.name).join(' · ')}</p>
          </div>



          <label className="mt-6 flex items-center gap-3 rounded-lg border border-deck-700 bg-deck-900/60 p-3 text-sm">
            <input
              type="checkbox"
              checked={includeObstacle}
              onChange={(event) => setIncludeObstacle(event.target.checked)}
              className="h-4 w-4"
            />
            <span>
              <span className="block font-semibold text-white">Incluir obstáculo</span>
              <span className="text-xs text-deck-200">Por defecto va apagado para jugar rápido en calle.</span>
            </span>
          </label>

          <button
            type="button"
            onClick={rollDice}
            disabled={isRolling}
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-deck-900 transition hover:bg-deck-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isRolling ? 'Girando dados...' : 'Lanzar dados'}
          </button>
          <p className="mt-3 text-xs text-deck-200">
            Preset realista: {Math.round(dynamics.durationMs / 10) / 100}s, stagger {dynamics.staggerMs}ms,
            shake {dynamics.shakePx}px.
          </p>
        </article>

        <article className="rounded-xl border border-deck-700 bg-deck-800 p-4 sm:p-6">
          <h2 className="text-xl font-semibold">2) Resultado</h2>

          <div className="mt-5 grid grid-cols-3 gap-2 [perspective:900px] sm:gap-3 sm:[perspective:1100px]">
            {tileLabels.map((label, index) => {
              const previewValue =
                label === 'Postura'
                  ? preview?.stance
                  : label === 'Obstáculo'
                    ? preview?.obstacle
                    : preview?.trick.name;

              const finalValue =
                label === 'Postura'
                  ? result?.stance
                  : label === 'Obstáculo'
                    ? result?.obstacle
                    : result?.trick.name;

              const baseValue = isRolling ? previewValue ?? '...' : finalValue ?? '—';
              const value =
                label === 'Obstáculo' && !showObstacleValue && !isRolling ? NO_OBSTACLE_LABEL : baseValue;
              const spinX = 180 + dynamics.tiltDeg * 2 + index * 18;
              const spinY = -(170 + dynamics.tiltDeg * 1.5 + index * 14);
              const spinZ = 120 + index * 22;

              return (
                <motion.div
                  key={`${label}-${rollId}`}
                  className="min-h-24 rounded-lg border border-deck-700 bg-deck-900/70 p-3 text-center [backface-visibility:hidden] [transform-style:preserve-3d] sm:min-h-0 sm:p-4"
                  style={{ transformPerspective: 1100, transformOrigin: '50% 50%' }}
                  initial={false}
                  animate={
                    isRolling
                      ? {
                          x: [0, dynamics.shakePx, -dynamics.shakePx, 0],
                          y: [0, -6, 4, 0],
                          rotateX: [0, spinX],
                          rotateY: [0, spinY],
                          rotateZ: [0, spinZ],
                          scale: [1, 1.05, 1],
                          filter: ['blur(0px)', 'blur(1.8px)', 'blur(0px)'],
                        }
                      : {
                          x: 0,
                          y: 0,
                          rotateX: 0,
                          rotateY: 0,
                          rotateZ: 0,
                          scale: 1,
                          filter: 'blur(0px)',
                        }
                  }
                  transition={
                    isRolling
                      ? {
                          x: {
                            duration: 0.34,
                            delay: (index * dynamics.staggerMs) / 1000,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          y: {
                            duration: 0.34,
                            delay: (index * dynamics.staggerMs) / 1000,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          rotateX: {
                            duration: 0.48,
                            delay: (index * dynamics.staggerMs) / 1000,
                            repeat: Infinity,
                            ease: 'linear',
                          },
                          rotateY: {
                            duration: 0.52,
                            delay: (index * dynamics.staggerMs) / 1000,
                            repeat: Infinity,
                            ease: 'linear',
                          },
                          rotateZ: {
                            duration: 0.58,
                            delay: (index * dynamics.staggerMs) / 1000,
                            repeat: Infinity,
                            ease: 'linear',
                          },
                          scale: {
                            duration: 0.4,
                            delay: (index * dynamics.staggerMs) / 1000,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          filter: {
                            duration: 0.32,
                            delay: (index * dynamics.staggerMs) / 1000,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }
                      : {
                          duration: 0.28,
                          ease: 'easeOut',
                        }
                  }
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-deck-200 sm:text-xs sm:tracking-[0.2em]">{label}</p>
                  <p className="mt-2 text-xs font-semibold text-white sm:text-sm">{value}</p>
                </motion.div>
              );
            })}
          </div>

          {result ? (
            <div className="mt-5 rounded-lg border border-lime-400/40 bg-lime-500/10 p-4 text-sm">
              <p className="font-semibold text-lime-200">Dificultad aplicada: {result.adaptedDifficulty}</p>
              <p className="mt-1 text-deck-100">Tip: {result.trick.note}</p>

              <div className="mt-4 rounded-md border border-deck-700 bg-deck-900/50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-deck-200">Buscar este resultado</p>
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex rounded-md bg-white px-3 py-2 text-xs font-semibold text-deck-900 transition hover:bg-deck-200 sm:text-sm"
                >
                  Buscar resultado en YouTube
                </a>
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block break-all text-xs text-blue-300 underline decoration-blue-400/70 underline-offset-2"
                >
                  {youtubeSearchUrl}
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-deck-200">Lanza los dados para recibir tu próximo reto.</p>
          )}
        </article>
      </div>
    </section>
  );
}
