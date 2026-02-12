import { TrickVideo } from '@/components/youtube/trick-video';
import { NO_OBSTACLE_LABEL } from '@/features/dice/config';
import { DiceResult } from '@/features/dice/types';

type RollSummaryProps = {
  result: DiceResult | null;
};

export function RollSummary({ result }: RollSummaryProps) {
  if (!result) {
    return null;
  }

  const showObstacleTip = result.obstacle !== NO_OBSTACLE_LABEL && result.trick.obstacleNote;

  return (
    <div className="mt-4 space-y-3 sm:mt-8 sm:space-y-4">
      <div className="rounded-xl border border-white/15 bg-white/[0.04] p-4 sm:rounded-2xl sm:p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-deck-300 sm:text-xs sm:tracking-[0.2em]">Ver tutorial</p>
        <p className="mt-1.5 text-xs text-deck-300 sm:mt-2 sm:text-sm">Dificultad aplicada: {result.adaptedDifficulty}</p>
        <p className="mt-1 text-sm text-white sm:text-base">Tip: {result.trick.note}</p>
        {showObstacleTip ? <p className="mt-1 text-xs text-hype-cyan sm:text-sm">Tip de obstáculo: {result.trick.obstacleNote}</p> : null}
      </div>

      <TrickVideo trickName={result.trick.name} />
    </div>
  );
}
