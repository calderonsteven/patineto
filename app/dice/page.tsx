'use client';

import { DifficultySelector } from '@/components/dice/difficulty-selector';
import { RollResultTiles } from '@/components/dice/roll-result-tiles';
import { RollSummary } from '@/components/dice/roll-summary';
import { NO_OBSTACLE_LABEL } from '@/features/dice/config';
import { buildResultQuery } from '@/features/dice/utils';
import { useDiceRoller } from '@/hooks/use-dice-roller';
import { useYoutubeSearchUrl } from '@/hooks/use-youtube-search-url';

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
  const youtubeSearchUrl = useYoutubeSearchUrl(buildResultQuery(result));

  return (
    <section className="space-y-6 sm:space-y-8">
      <header className="neo-panel space-y-2 p-6 sm:p-7">
        <p className="text-sm uppercase tracking-[0.2em] text-hype-cyan">Módulo</p>
        <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Juego de Dados</h1>
        <p className="max-w-3xl text-deck-300">
          Elige una dificultad y lanza los dados para generar un reto de skate con postura, obstáculo y truco.
          Ajustamos automáticamente la complejidad para mantener variedad sin romper tu nivel.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.2fr]">
        <article className="neo-panel p-4 sm:p-6">
          <h2 className="text-xl font-semibold">1) Selecciona dificultad</h2>
          <DifficultySelector selectedDifficulty={selectedDifficulty} onChangeDifficulty={setSelectedDifficulty} />

          <div className="surface-muted mt-6 p-4 text-sm text-deck-300">
            <p className="font-semibold text-white">Banco actual ({selectedDifficulty})</p>
            <p className="mt-2">Trucos disponibles: {activePool.tricks.map((trick) => trick.name).join(' · ')}</p>
          </div>

          <label className="surface-muted mt-6 flex items-center gap-3 p-3 text-sm">
            <input
              type="checkbox"
              checked={includeObstacle}
              onChange={(event) => setIncludeObstacle(event.target.checked)}
              className="h-4 w-4"
            />
            <span>
              <span className="block font-semibold text-white">Incluir obstáculo</span>
              <span className="text-xs text-deck-300">Por defecto va apagado para jugar rápido en calle.</span>
            </span>
          </label>

          <button
            type="button"
            onClick={rollDice}
            disabled={isRolling}
            className="neo-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isRolling ? 'Girando dados...' : 'Lanzar dados'}
          </button>
          <p className="mt-3 text-xs text-deck-300">
            Preset realista: {Math.round(dynamics.durationMs / 10) / 100}s, stagger {dynamics.staggerMs}ms, shake{' '}
            {dynamics.shakePx}px.
          </p>
        </article>

        <article className="neo-panel p-4 sm:p-6">
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
            <p className="mt-3 text-xs text-deck-300">Obstáculo actual: {NO_OBSTACLE_LABEL}</p>
          ) : null}

          <RollSummary result={result} youtubeSearchUrl={youtubeSearchUrl} />
        </article>
      </div>
    </section>
  );
}
