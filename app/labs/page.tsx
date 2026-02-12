'use client';

import Image from 'next/image';
import { useState } from 'react';

type TrickStatus = 'lo-quiero' | 'practicando' | 'lo-tengo';

type Trick = {
  id: string;
  name: string;
  difficulty: string;
  previewImage: string;
};

const createPreviewImage = (title: string, colorA: string, colorB: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 700'>
    <defs>
      <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${colorA}' />
        <stop offset='100%' stop-color='${colorB}' />
      </linearGradient>
    </defs>
    <rect width='1200' height='700' fill='url(#bg)' />
    <circle cx='250' cy='220' r='140' fill='rgba(255,255,255,.18)' />
    <circle cx='970' cy='540' r='170' fill='rgba(255,255,255,.14)' />
    <text x='60' y='590' fill='white' font-family='Arial, sans-serif' font-size='90' font-weight='700'>${title}</text>
    <text x='60' y='650' fill='rgba(255,255,255,.85)' font-family='Arial, sans-serif' font-size='36'>Preview temporal del truco</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const tricks: Trick[] = [
  {
    id: 'kickflip',
    name: 'Kickflip',
    difficulty: 'Intermedio',
    previewImage: createPreviewImage('Kickflip', '#312e81', '#0f172a'),
  },
  {
    id: 'heelflip',
    name: 'Heelflip',
    difficulty: 'Intermedio',
    previewImage: createPreviewImage('Heelflip', '#1d4ed8', '#0f172a'),
  },
  {
    id: 'tre-flip',
    name: 'Tre Flip',
    difficulty: 'Avanzado',
    previewImage: createPreviewImage('Tre Flip', '#be185d', '#0f172a'),
  },
  {
    id: 'frontside-180',
    name: 'Frontside 180',
    difficulty: 'Principiante',
    previewImage: createPreviewImage('Frontside 180', '#0f766e', '#0f172a'),
  },
];

const statusLabels: Record<TrickStatus, string> = {
  'lo-quiero': 'Lo quiero',
  practicando: 'Lo estoy practicando',
  'lo-tengo': 'Lo tengo',
};

const statusStyles: Record<TrickStatus, string> = {
  'lo-quiero': 'border-deck-600 bg-deck-900 text-deck-200 hover:border-deck-400',
  practicando: 'border-amber-300/60 bg-amber-500/10 text-amber-100 hover:border-amber-300',
  'lo-tengo': 'border-emerald-300/70 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300',
};

export default function LabsPage() {
  const [statusByTrick, setStatusByTrick] = useState<Record<string, TrickStatus>>({});

  const updateStatus = (trickId: string, status: TrickStatus) => {
    setStatusByTrick((current) => ({ ...current, [trickId]: status }));
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Interna</p>
        <h1 className="text-3xl font-bold tracking-tight">Labs · Trick Checklist</h1>
        <p className="max-w-3xl text-base leading-7 text-deck-200">
          Marca tus trucos por estado y deja listo el flujo para subir o grabar evidencia en video. Esta versión no usa
          base de datos ni API: todo funciona en memoria para validar la experiencia.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {tricks.map((trick) => {
          const selectedStatus = statusByTrick[trick.id];

          return (
            <article key={trick.id} className="overflow-hidden rounded-xl border border-deck-700 bg-deck-800">
              <Image
                src={trick.previewImage}
                alt={`Preview del truco ${trick.name}`}
                width={1200}
                height={700}
                className="h-48 w-full object-cover"
              />

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{trick.name}</h2>
                    <p className="text-sm text-deck-200">Dificultad: {trick.difficulty}</p>
                  </div>
                  <span className="rounded-full border border-deck-600 px-3 py-1 text-xs uppercase tracking-wide text-deck-200">
                    {selectedStatus ? statusLabels[selectedStatus] : 'Sin estado'}
                  </span>
                </div>

                <div className="grid gap-2">
                  {(Object.keys(statusLabels) as TrickStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(trick.id, status)}
                      className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                        selectedStatus === status
                          ? statusStyles[status]
                          : 'border-deck-700 bg-deck-900/60 text-deck-200 hover:border-deck-500'
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 border-t border-deck-700 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-deck-900 transition hover:bg-deck-200"
                  >
                    Subir video del truco
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-deck-600 px-4 py-2 text-sm font-semibold text-deck-100 transition hover:border-deck-400"
                  >
                    Grabar video del truco
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
