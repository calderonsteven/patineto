import { difficulties } from '@/features/dice/config';
import { Difficulty } from '@/features/dice/types';

type DifficultySelectorProps = {
  selectedDifficulty: Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
};

export function DifficultySelector({ selectedDifficulty, onChangeDifficulty }: DifficultySelectorProps) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:mt-3 sm:gap-2">
      {difficulties.map((difficulty) => {
        const isActive = selectedDifficulty === difficulty.value;

        return (
          <button
            key={difficulty.value}
            type="button"
            onClick={() => onChangeDifficulty(difficulty.value)}
            aria-pressed={isActive}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition sm:px-4 sm:py-2 sm:text-sm ${
              isActive
                ? 'border-hype-cyan/80 bg-hype-cyan/25 text-white shadow-lg shadow-hype-cyan/25'
                : 'border-white/10 bg-white/5 text-deck-300 hover:border-white/25 hover:text-white'
            }`}
          >
            {difficulty.label}
          </button>
        );
      })}
    </div>
  );
}
