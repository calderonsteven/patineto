'use client';

import { motion } from 'framer-motion';

import { DifficultySelector } from '@/components/dice/difficulty-selector';
import { RollResultTiles } from '@/components/dice/roll-result-tiles';
import { RollSummary } from '@/components/dice/roll-summary';
import { useDiceRoller } from '@/hooks/use-dice-roller';

export default function DicePage() {
  const {
    selectedDifficulty,
    setSelectedDifficulty,
    isRolling,
    rollId,
    includeObstacle,
    setIncludeObstacle,
    selectedObstacles,
    toggleObstacle,
    dynamics,
    result,
    preview,
    activePool,
    rollDice,
    resetResult,
  } = useDiceRoller();

  const showObstacleValue = includeObstacle || isRolling || Boolean(result);
  const hasResult = Boolean(result);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111235] via-[#191b44] to-[#22144f] px-3 py-5 shadow-2xl shadow-black/35 sm:rounded-3xl sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.2),transparent_38%)]" />

      {!hasResult ? (
        <div className="relative mx-auto flex min-h-[66vh] w-full max-w-3xl flex-col items-center justify-center">
          <h1 className="text-center text-[10px] uppercase tracking-[0.34em] text-hype-cyan/80 sm:text-xs">Juego de Dados</h1>

          <DifficultySelector selectedDifficulty={selectedDifficulty} onChangeDifficulty={setSelectedDifficulty} />

          <label className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-deck-200 sm:mt-6 sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
            <span>Incluir obstáculo</span>
            <button
              type="button"
              role="switch"
              aria-checked={includeObstacle}
              onClick={() => setIncludeObstacle(!includeObstacle)}
              className={`relative h-5 w-10 rounded-full transition sm:h-6 sm:w-11 ${includeObstacle ? 'bg-hype-cyan' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition sm:h-5 sm:w-5 ${includeObstacle ? 'left-[20px] sm:left-[22px]' : 'left-0.5'}`}
              />
            </button>
          </label>

          {includeObstacle ? (
            <div className="mt-4 w-full max-w-xl rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-deck-300 sm:text-xs">Obstáculos disponibles</p>
              <p className="mt-1 text-center text-xs text-deck-300 sm:text-sm">Selecciona uno o más para filtrar la tirada.</p>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {activePool.obstacle.map((obstacle) => {
                  const isSelected = selectedObstacles.includes(obstacle);
                  return (
                    <button
                      key={obstacle}
                      type="button"
                      onClick={() => toggleObstacle(obstacle)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition sm:text-sm ${
                        isSelected
                          ? 'border-hype-cyan/70 bg-hype-cyan/20 text-white'
                          : 'border-white/20 bg-white/5 text-deck-200 hover:border-white/40'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}
                      {obstacle}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <motion.button
            type="button"
            onClick={rollDice}
            disabled={isRolling}
            className="mt-8 h-44 w-44 rounded-full border border-white/20 bg-white/10 text-xl font-black uppercase tracking-[0.11em] text-white shadow-[0_0_50px_rgba(34,211,238,0.3)] transition hover:scale-[1.02] disabled:cursor-not-allowed sm:mt-10 sm:h-52 sm:w-52 sm:text-2xl"
            animate={
              isRolling
                ? {
                    scale: [1, 1.08, 1.03, 1],
                    x: [0, -3, 3, -2, 0],
                  }
                : {
                    scale: 1,
                    x: 0,
                  }
            }
            transition={
              isRolling
                ? {
                    duration: 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : { duration: 0.2 }
            }
          >
            {isRolling ? 'Rodando...' : 'Lanzar'}
          </motion.button>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-4xl py-1 sm:py-4">
          <RollResultTiles
            isRolling={isRolling}
            rollId={rollId}
            dynamics={dynamics}
            result={result}
            preview={preview}
            showObstacleValue={showObstacleValue}
          />

          <RollSummary result={result} />

          <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={rollDice}
              disabled={isRolling}
              className="neo-button w-full justify-center py-2.5 text-sm sm:w-auto sm:min-w-56 sm:py-3 sm:text-base"
            >
              🔁 Repetir tirada
            </button>
            <button
              type="button"
              onClick={resetResult}
              className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-deck-100 transition hover:border-white/35 hover:bg-white/10 sm:w-auto sm:min-w-56 sm:px-5 sm:py-3 sm:text-base"
            >
              ⚙ Cambiar configuración
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
