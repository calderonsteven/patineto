'use client';

import { TrickVideo } from '@/components/youtube/trick-video';
import { useState } from 'react';

export default function SkatePage() {
  const [trickName, setTrickName] = useState('');

  return (
    <section className="space-y-6">
      <header className="neo-panel space-y-2 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-hype-pink">Módulo</p>
        <h1 className="text-3xl font-black tracking-tight">Juego de S.K.A.T.E</h1>
      </header>

      <div className="neo-panel space-y-5 p-6">
        <h2 className="text-xl font-semibold">Busca un truco en YouTube</h2>
        <p className="leading-7 text-deck-300">
          Escribe el nombre del truco y te mostramos el link de búsqueda. En el siguiente paso podremos mostrar el
          video directamente dentro de esta pantalla.
        </p>

        <div className="space-y-3">
          <label htmlFor="trick-name" className="block text-sm font-medium text-deck-300">
            Nombre del truco
          </label>
          <input
            id="trick-name"
            type="text"
            value={trickName}
            onChange={(event) => setTrickName(event.target.value)}
            placeholder="Ejemplo: kickflip"
            className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-deck-300 focus:border-hype-cyan focus:outline-none"
          />
        </div>
        
        <TrickVideo trickName={trickName} />
      </div>
    </section>
  );
}
