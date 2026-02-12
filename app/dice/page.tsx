'use client';

import { motion } from 'framer-motion';

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
    rollDice,
    resetResult,
  } = useDiceRoller();

  const showObstacleValue = includeObstacle || isRolling || Boolean(result);
  const hasResult = Boolean(result);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111235] via-[#191b44] to-[#22144f] px-4 py-8 shadow-2xl shadow-black/35 sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.2),transparent_38%)]" />

      {!hasResult ? (
        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-3xl flex-col items-center justify-center">
          <h1 className="text-center text-xs uppercase tracking-[0.4em] text-hype-cyan/80 sm:text-sm">Juego de Dados</h1>

          <DifficultySelector selectedDifficulty={selectedDifficulty} onChangeDifficulty={setSelectedDifficulty} />

          <label className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-deck-200">
            <span>Incluir obstáculo</span>
            <button
              type="button"
              role="switch"
              aria-checked={includeObstacle}
              onClick={() => setIncludeObstacle(!includeObstacle)}
              className={`relative h-6 w-11 rounded-full transition ${includeObstacle ? 'bg-hype-cyan' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${includeObstacle ? 'left-[22px]' : 'left-0.5'}`}
              />
            </button>
          </label>

          <motion.button
            type="button"
            onClick={rollDice}
            disabled={isRolling}
            className="mt-10 h-52 w-52 rounded-full border border-white/20 bg-white/10 text-2xl font-black uppercase tracking-[0.12em] text-white shadow-[0_0_60px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed"
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

          {!showObstacleValue && !isRolling ? <p className="mt-6 text-xs text-deck-300">Obstáculo actual: {NO_OBSTACLE_LABEL}</p> : null}
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-4xl py-6">
          <RollResultTiles
            isRolling={isRolling}
            rollId={rollId}
            dynamics={dynamics}
            result={result}
            preview={preview}
            showObstacleValue={showObstacleValue}
          />

          <RollSummary result={result} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={rollDice}
              disabled={isRolling}
              className="neo-button w-full justify-center py-3 text-base sm:w-auto sm:min-w-56"
            >
              🔁 Repetir tirada
            </button>
            <button
              type="button"
              onClick={resetResult}
              className="w-full rounded-full border border-white/20 bg-white/5 px-5 py-3 text-base font-semibold text-deck-100 transition hover:border-white/35 hover:bg-white/10 sm:w-auto sm:min-w-56"
            >
              ⚙ Cambiar configuración
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
