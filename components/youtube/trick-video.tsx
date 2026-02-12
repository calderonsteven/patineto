'use client';

import { useEffect, useMemo, useState } from 'react';

type TrickVideoProps = {
  trickName: string;
};

type SearchState = {
  videoId: string;
  error: string;
  isLoading: boolean;
};

const INITIAL_STATE: SearchState = {
  videoId: '',
  error: '',
  isLoading: false,
};

export function TrickVideo({ trickName }: TrickVideoProps) {
  const normalizedTrickName = trickName.trim();
  const query = useMemo(() => {
    if (!normalizedTrickName) {
      return '';
    }

    return `${normalizedTrickName} skate trick`;
  }, [normalizedTrickName]);

  const [{ videoId, error, isLoading }, setSearchState] = useState<SearchState>(INITIAL_STATE);

  useEffect(() => {
    if (!query) {
      setSearchState(INITIAL_STATE);
      return;
    }

    const abortController = new AbortController();

    async function searchVideo() {
      setSearchState((previous) => ({ ...previous, isLoading: true, error: '' }));

      try {
        const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(query)}`, {
          signal: abortController.signal,
        });

        const payload = (await response.json()) as { videoId?: string; error?: string };

        if (!response.ok || !payload.videoId) {
          setSearchState({
            videoId: '',
            error: payload.error || 'No se pudo obtener un video para este truco.',
            isLoading: false,
          });
          return;
        }

        setSearchState({ videoId: payload.videoId, error: '', isLoading: false });
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return;
        }

        setSearchState({
          videoId: '',
          error: 'Error de conexión buscando videos. Intenta nuevamente.',
          isLoading: false,
        });
      }
    }

    searchVideo();

    return () => {
      abortController.abort();
    };
  }, [query]);

  if (!normalizedTrickName) {
    return (
      <div className="rounded-lg border border-deck-700 bg-deck-900/60 p-4 text-sm text-deck-200">
        <p>Escribe o genera un truco para cargar un tutorial en video.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-deck-700 bg-deck-900/60 p-4 text-sm text-deck-200">
      <p className="text-xs uppercase tracking-[0.16em] text-deck-300">Tutorial sugerido</p>
      <p className="font-medium text-white">{normalizedTrickName}</p>

      {isLoading ? <p>Buscando el mejor video en YouTube...</p> : null}

      {error ? (
        <p role="alert" className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {!isLoading && !error && videoId ? (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-deck-600 bg-black">
          <iframe
            title={`Video de YouTube para ${normalizedTrickName}`}
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
}
