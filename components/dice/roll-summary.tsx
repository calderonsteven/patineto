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

      <div className="surface-muted mt-4 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-deck-300">Buscar este resultado</p>
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="neo-button mt-2 text-xs sm:text-sm"
        >
          Buscar resultado en YouTube
        </a>
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all text-xs text-blue-300 underline decoration-blue-400/70 underline-offset-2"
        >
          {youtubeSearchUrl}
        </a>
      </div>

      <TrickVideo trickName={result.trick.name} />
    </div>
  );
}
