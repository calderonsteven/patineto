'use client';

import { DifficultySelector } from '@/components/dice/difficulty-selector';
import { RollResultTiles } from '@/components/dice/roll-result-tiles';
import { RollSummary } from '@/components/dice/roll-summary';
import { NO_OBSTACLE_LABEL } from '@/features/dice/config';
import { useDiceRoller } from '@/hooks/use-dice-roller';

export default function DicePage() {
  const {
    selectedDifficulty,
    setSelectedDifficulty,
    isRolling,
    rollId,
    includeObstacle,
    setIncludeObstacle,
    dynamics,
    result,
    preview,
    activePool,
    rollDice,
  } = useDiceRoller();

  const showObstacleValue = includeObstacle || isRolling || Boolean(result);
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
          <DifficultySelector selectedDifficulty={selectedDifficulty} onChangeDifficulty={setSelectedDifficulty} />

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
            Preset realista: {Math.round(dynamics.durationMs / 10) / 100}s, stagger {dynamics.staggerMs}ms, shake{' '}
            {dynamics.shakePx}px.
          </p>
        </article>

        <article className="rounded-xl border border-deck-700 bg-deck-800 p-4 sm:p-6">
          <h2 className="text-xl font-semibold">2) Resultado</h2>

          <RollResultTiles
            isRolling={isRolling}
            rollId={rollId}
            dynamics={dynamics}
            result={result}
            preview={preview}
            showObstacleValue={showObstacleValue}
          />

          {!showObstacleValue && !isRolling && !result ? (
            <p className="mt-3 text-xs text-deck-200">Obstáculo actual: {NO_OBSTACLE_LABEL}</p>
          ) : null}

          <RollSummary result={result} />
        </article>
      </div>
    </section>
  );
}
