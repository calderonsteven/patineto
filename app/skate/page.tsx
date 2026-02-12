'use client';

import { useMemo, useState } from 'react';

export default function SkatePage() {
  const [trick, setTrick] = useState('');

  const youtubeSearchUrl = useMemo(() => {
    const cleanedTrick = trick.trim();

    if (!cleanedTrick) {
      return '';
    }

    const query = encodeURIComponent(`${cleanedTrick} skate trick`);
    return `https://www.youtube.com/results?search_query=${query}`;
  }, [trick]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Módulo</p>
        <h1 className="text-3xl font-bold tracking-tight">Juego de S.K.A.T.E</h1>
      </header>

      <div className="space-y-5 rounded-xl border border-deck-700 bg-deck-800 p-6">
        <h2 className="text-xl font-semibold">Busca un truco en YouTube</h2>
        <p className="leading-7 text-deck-200">
          Escribe el nombre del truco y te mostramos el link de búsqueda. En el siguiente paso podremos mostrar el
          video directamente dentro de esta pantalla.
        </p>

        <div className="space-y-3">
          <label htmlFor="trick-name" className="block text-sm font-medium text-deck-200">
            Nombre del truco
          </label>
          <input
            id="trick-name"
            type="text"
            value={trick}
            onChange={(event) => setTrick(event.target.value)}
            placeholder="Ejemplo: kickflip"
            className="w-full rounded-md border border-deck-600 bg-deck-900 px-3 py-2 text-sm text-white placeholder:text-deck-300 focus:border-white focus:outline-none"
          />
        </div>

        <a
          href={youtubeSearchUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!youtubeSearchUrl}
          className="inline-flex w-fit rounded-md bg-white px-4 py-2 text-sm font-semibold text-deck-900 transition hover:bg-deck-200 aria-disabled:cursor-not-allowed aria-disabled:bg-deck-600 aria-disabled:text-deck-300"
        >
          Buscar en YouTube
        </a>

        <div className="rounded-lg border border-deck-700 bg-deck-900/60 p-4 text-sm text-deck-200">
          {youtubeSearchUrl ? (
            <>
              <p className="font-medium text-white">Link generado:</p>
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all text-blue-300 underline decoration-blue-400/70 underline-offset-2"
              >
                {youtubeSearchUrl}
              </a>
            </>
          ) : (
            <p>Escribe un truco para generar el link de búsqueda en YouTube.</p>
          )}
        </div>
      </div>
    </section>
  );
}
