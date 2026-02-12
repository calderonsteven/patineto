import { TrickVideo } from '@/components/youtube/trick-video';
import { DiceResult } from '@/features/dice/types';

type RollSummaryProps = {
  result: DiceResult | null;
};

export function RollSummary({ result }: RollSummaryProps) {
  if (!result) {
    return <p className="mt-5 text-sm text-deck-300">Lanza los dados para recibir tu próximo reto.</p>;
  }

  return (
    <div className="mt-5 rounded-lg border border-hype-cyan/40 bg-hype-cyan/10 p-4 text-sm shadow-lg shadow-hype-cyan/10">
      <p className="font-semibold text-lime-200">Dificultad aplicada: {result.adaptedDifficulty}</p>
      <p className="mt-1 text-white">Tip: {result.trick.note}</p>

      <TrickVideo trickName={result.trick.name} />
    </div>
  );
}
