import { DiceResult } from '@/features/dice/types';

type RollSummaryProps = {
  result: DiceResult | null;
  youtubeSearchUrl: string;
};

export function RollSummary({ result, youtubeSearchUrl }: RollSummaryProps) {
  if (!result) {
    return <p className="mt-5 text-sm text-deck-200">Lanza los dados para recibir tu próximo reto.</p>;
  }

  return (
    <div className="mt-5 rounded-lg border border-lime-400/40 bg-lime-500/10 p-4 text-sm">
      <p className="font-semibold text-lime-200">Dificultad aplicada: {result.adaptedDifficulty}</p>
      <p className="mt-1 text-deck-100">Tip: {result.trick.note}</p>

      <div className="mt-4 rounded-md border border-deck-700 bg-deck-900/50 p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-deck-200">Buscar este resultado</p>
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-md bg-white px-3 py-2 text-xs font-semibold text-deck-900 transition hover:bg-deck-200 sm:text-sm"
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
    </div>
  );
}
