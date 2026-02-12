'use client';

import { TrickVideo } from '@/components/youtube/trick-video';
import { useState } from 'react';

export default function SkatePage() {
  const [trickName, setTrickName] = useState('');

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Módulo</p>
        <h1 className="text-3xl font-bold tracking-tight">Juego de S.K.A.T.E</h1>
      </header>

      <div className="space-y-5 rounded-xl border border-deck-700 bg-deck-800 p-6">
        <h2 className="text-xl font-semibold">Buscar tutorial por nombre de truco</h2>
        <p className="leading-7 text-deck-200">
          Escribe el nombre del truco y te mostramos automáticamente el primer video relevante de YouTube dentro de
          esta pantalla.
        </p>

        <div className="space-y-3">
          <label htmlFor="trick-name" className="block text-sm font-medium text-deck-200">
            Nombre del truco
          </label>
          <input
            id="trick-name"
            type="text"
            value={trickName}
            onChange={(event) => setTrickName(event.target.value)}
            placeholder="Ejemplo: kickflip"
            className="w-full rounded-md border border-deck-600 bg-deck-900 px-3 py-2 text-sm text-white placeholder:text-deck-300 focus:border-white focus:outline-none"
          />
        </div>

        <TrickVideo trickName={trickName} />
      </div>
    </section>
  );
}
