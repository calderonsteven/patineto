import { motion } from 'framer-motion';

import { NO_OBSTACLE_LABEL, tileLabels } from '@/features/dice/config';
import { DiceResult, RollDynamics } from '@/features/dice/types';

type PreviewResult = Omit<DiceResult, 'adaptedDifficulty'>;

type RollResultTilesProps = {
  isRolling: boolean;
  rollId: number;
  dynamics: RollDynamics;
  result: DiceResult | null;
  preview: PreviewResult | null;
  showObstacleValue: boolean;
};

const cardStyles = [
  'border-fuchsia-300/35 bg-fuchsia-500/5 shadow-fuchsia-400/20',
  'border-amber-300/35 bg-amber-500/5 shadow-amber-300/20',
  'border-hype-cyan/40 bg-hype-cyan/10 shadow-hype-cyan/25',
];

export function RollResultTiles({ isRolling, rollId, dynamics, result, preview, showObstacleValue }: RollResultTilesProps) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 sm:mt-8 sm:gap-3">
      {tileLabels.map((label, index) => {
        const previewValue = label === 'Postura' ? preview?.stance : label === 'Obstáculo' ? preview?.obstacle : preview?.trick.name;

        const finalValue = label === 'Postura' ? result?.stance : label === 'Obstáculo' ? result?.obstacle : result?.trick.name;

        const baseValue = isRolling ? previewValue ?? '...' : finalValue ?? '—';
        const value = label === 'Obstáculo' && !showObstacleValue && !isRolling ? NO_OBSTACLE_LABEL : baseValue;

        const isTrick = label === 'Truco';

        return (
          <motion.article
            key={`${label}-${rollId}`}
            className={`w-full max-w-xl rounded-xl border p-4 text-center shadow-xl sm:rounded-2xl sm:p-5 sm:shadow-2xl ${cardStyles[index]}`}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={
              isRolling
                ? {
                    opacity: 1,
                    y: [0, -4, 0],
                    x: [0, dynamics.shakePx * 0.6, -dynamics.shakePx * 0.6, 0],
                    scale: [1, 1.01, 1],
                  }
                : { opacity: 1, y: 0, x: 0, scale: 1 }
            }
            transition={
              isRolling
                ? {
                    duration: 0.28,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : {
                    duration: 0.4,
                    delay: index * 0.18,
                    ease: 'easeOut',
                  }
            }
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-deck-300 sm:text-[11px] sm:tracking-[0.22em]">{label}</p>
            <p className={`mt-1.5 font-bold leading-tight sm:mt-2 ${isTrick ? 'text-2xl text-hype-cyan sm:text-5xl' : 'text-xl sm:text-3xl'}`}>
              {value}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}
