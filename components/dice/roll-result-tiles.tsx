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

export function RollResultTiles({ isRolling, rollId, dynamics, result, preview, showObstacleValue }: RollResultTilesProps) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 [perspective:900px] sm:gap-3 sm:[perspective:1100px]">
      {tileLabels.map((label, index) => {
        const previewValue = label === 'Postura' ? preview?.stance : label === 'Obstáculo' ? preview?.obstacle : preview?.trick.name;

        const finalValue = label === 'Postura' ? result?.stance : label === 'Obstáculo' ? result?.obstacle : result?.trick.name;

        const baseValue = isRolling ? previewValue ?? '...' : finalValue ?? '—';
        const value = label === 'Obstáculo' && !showObstacleValue && !isRolling ? NO_OBSTACLE_LABEL : baseValue;
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
  );
}
