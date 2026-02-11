'use client';

import { useMemo, useState } from 'react';

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

export default function DicePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('principiante');
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<{
    adaptedDifficulty: Difficulty;
    stance: string;
    obstacle: string;
    trick: Trick;
  } | null>(null);

  const activePool = useMemo(() => trickPools[selectedDifficulty], [selectedDifficulty]);

  const rollDice = () => {
    if (isRolling) {
      return;
    }

    setIsRolling(true);
    setResult(null);

    window.setTimeout(() => {
      const adaptedDifficulty = pickDifficulty(selectedDifficulty);
      const pool = trickPools[adaptedDifficulty];

      setResult({
        adaptedDifficulty,
        stance: randomFrom(pool.stance),
        obstacle: randomFrom(pool.obstacle),
        trick: randomFrom(pool.tricks),
      });
      setIsRolling(false);
    }, 1300);
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Módulo</p>
        <h1 className="text-3xl font-bold tracking-tight">Juego de Dados</h1>
        <p className="max-w-3xl text-deck-200">
          Elige una dificultad y lanza los dados para generar un reto de skate con postura, obstáculo y truco.
          Ajustamos automáticamente la complejidad para mantener variedad sin romper tu nivel.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-xl border border-deck-700 bg-deck-800 p-6">
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

          <button
            type="button"
            onClick={rollDice}
            disabled={isRolling}
            className="mt-6 inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-deck-900 transition hover:bg-deck-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRolling ? 'Girando dados...' : 'Lanzar dados'}
          </button>
        </article>

        <article className="rounded-xl border border-deck-700 bg-deck-800 p-6">
          <h2 className="text-xl font-semibold">2) Resultado</h2>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {['Postura', 'Obstáculo', 'Truco'].map((label, index) => (
              <div
                key={label}
                className={`rounded-lg border border-deck-700 bg-deck-900/70 p-4 text-center ${
                  isRolling ? 'animate-pulse' : ''
                }`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-deck-200">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {isRolling
                    ? '...'
                    : label === 'Postura'
                      ? result?.stance ?? '—'
                      : label === 'Obstáculo'
                        ? result?.obstacle ?? '—'
                        : result?.trick.name ?? '—'}
                </p>
              </div>
            ))}
          </div>

          {result ? (
            <div className="mt-5 rounded-lg border border-lime-400/40 bg-lime-500/10 p-4 text-sm">
              <p className="font-semibold text-lime-200">Dificultad aplicada: {result.adaptedDifficulty}</p>
              <p className="mt-1 text-deck-100">Tip: {result.trick.note}</p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-deck-200">Lanza los dados para recibir tu próximo reto.</p>
          )}
        </article>
      </div>
    </section>
  );
}
