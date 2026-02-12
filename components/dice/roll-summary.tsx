import { TrickVideo } from '@/components/youtube/trick-video';
import { DiceResult } from '@/features/dice/types';

type RollSummaryProps = {
  result: DiceResult | null;
};

export function RollSummary({ result }: RollSummaryProps) {
  if (!result) {
    return <p className="mt-5 text-sm text-deck-200">Lanza los dados para recibir tu próximo reto.</p>;
  }

  return (
    <div className="mt-5 space-y-4 rounded-lg border border-lime-400/40 bg-lime-500/10 p-4 text-sm">
      <div>
        <p className="font-semibold text-lime-200">Dificultad aplicada: {result.adaptedDifficulty}</p>
        <p className="mt-1 text-deck-100">Tip: {result.trick.note}</p>
      </div>

      <TrickVideo trickName={result.trick.name} />
    </div>
  );
}
