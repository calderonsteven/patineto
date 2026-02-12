import { difficulties } from '@/features/dice/config';
import { Difficulty } from '@/features/dice/types';

type DifficultySelectorProps = {
  selectedDifficulty: Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
};

export function DifficultySelector({ selectedDifficulty, onChangeDifficulty }: DifficultySelectorProps) {
  return (
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
            onChange={() => onChangeDifficulty(difficulty.value)}
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="block text-sm font-semibold text-white">{difficulty.label}</span>
            <span className="text-xs text-deck-200">{difficulty.hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
