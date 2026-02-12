import { TrickVideo } from '@/components/youtube/trick-video';
import { DiceResult } from '@/features/dice/types';

type RollSummaryProps = {
  result: DiceResult | null;
};

export function RollSummary({ result }: RollSummaryProps) {
  if (!result) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-deck-300">Ver tutorial</p>
        <p className="mt-2 text-sm text-deck-300">Dificultad aplicada: {result.adaptedDifficulty}</p>
        <p className="mt-1 text-white">Tip: {result.trick.note}</p>
      </div>

      <TrickVideo trickName={result.trick.name} />
    </div>
  );
}
