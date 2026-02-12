'use client';

import { useMemo, useState } from 'react';

type TrickStatus = 'no-lo-tengo' | 'practicando' | 'lo-tengo';

type Trick = {
  id: string;
  name: string;
  difficulty: string;
};

type TrickCategory = {
  id: string;
  title: string;
  tricks: Trick[];
};

const trickCategories: TrickCategory[] = [
  {
    id: 'flips',
    title: 'Flips',
    tricks: [
      { id: 'kickflip', name: 'Kickflip', difficulty: 'Intermedio' },
      { id: 'heelflip', name: 'Heelflip', difficulty: 'Intermedio' },
      { id: 'tre-flip', name: 'Tre Flip', difficulty: 'Avanzado' },
    ],
  },
  {
    id: 'grinds',
    title: 'Grinds',
    tricks: [
      { id: '50-50-grind', name: '50-50 Grind', difficulty: 'Principiante' },
      { id: 'boardslide', name: 'Boardslide', difficulty: 'Intermedio' },
      { id: 'nosegrind', name: 'Nosegrind', difficulty: 'Avanzado' },
    ],
  },
  {
    id: 'manuales',
    title: 'Manuales',
    tricks: [
      { id: 'manual', name: 'Manual', difficulty: 'Principiante' },
      { id: 'nose-manual', name: 'Nose Manual', difficulty: 'Intermedio' },
      { id: 'manual-180-out', name: 'Manual 180 Out', difficulty: 'Avanzado' },
    ],
  },
];

const statusLabels: Record<TrickStatus, string> = {
  'no-lo-tengo': 'No lo tengo',
  practicando: 'Lo estoy practicando',
  'lo-tengo': 'Lo tengo',
};

const statusButtonStyles: Record<TrickStatus, string> = {
  'no-lo-tengo': 'border-slate-500/60 bg-slate-500/10 text-slate-100 hover:border-slate-400',
  practicando: 'border-amber-300/60 bg-amber-500/10 text-amber-100 hover:border-amber-300',
  'lo-tengo': 'border-emerald-300/70 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300',
};

const statusSegmentStyles: Record<TrickStatus, string> = {
  'no-lo-tengo': 'bg-slate-500/70',
  practicando: 'bg-amber-400/80',
  'lo-tengo': 'bg-emerald-500/80',
};

const statusOrder: TrickStatus[] = ['lo-tengo', 'practicando', 'no-lo-tengo'];
const statusDefault: TrickStatus = 'no-lo-tengo';

const allTricks = trickCategories.flatMap((category) => category.tricks);

export default function LabsPage() {
  const [statusByTrick, setStatusByTrick] = useState<Record<string, TrickStatus>>(() =>
    Object.fromEntries(allTricks.map((trick) => [trick.id, statusDefault])),
  );

  const updateStatus = (trickId: string, status: TrickStatus) => {
    setStatusByTrick((current) => ({ ...current, [trickId]: status }));
  };

  const categoryStats = useMemo(() => {
    return trickCategories.map((category) => {
      const totals = {
        'no-lo-tengo': 0,
        practicando: 0,
        'lo-tengo': 0,
      } satisfies Record<TrickStatus, number>;

      category.tricks.forEach((trick) => {
        const currentStatus = statusByTrick[trick.id] ?? statusDefault;
        totals[currentStatus] += 1;
      });

      const totalTricks = category.tricks.length;

      return {
        ...category,
        totals,
        totalTricks,
      };
    });
  }, [statusByTrick]);

  const globalStats = useMemo(() => {
    const totals = {
      'no-lo-tengo': 0,
      practicando: 0,
      'lo-tengo': 0,
    } satisfies Record<TrickStatus, number>;

    allTricks.forEach((trick) => {
      const currentStatus = statusByTrick[trick.id] ?? statusDefault;
      totals[currentStatus] += 1;
    });

    const totalTricks = allTricks.length;
    const completionPercent = totalTricks ? Math.round((totals['lo-tengo'] / totalTricks) * 100) : 0;

    return {
      totals,
      totalTricks,
      completionPercent,
    };
  }, [statusByTrick]);

  const categoryCompletion = useMemo(() => {
    return categoryStats.map((category) => {
      const completionPercent = category.totalTricks
        ? Math.round((category.totals['lo-tengo'] / category.totalTricks) * 100)
        : 0;

      return {
        id: category.id,
        title: category.title,
        completionPercent,
        totals: category.totals,
        totalTricks: category.totalTricks,
      };
    });
  }, [categoryStats]);

  return (
    <section className="space-y-7">
      <header className="space-y-3 rounded-xl border border-deck-700 bg-deck-800 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Interna</p>
        <h1 className="text-3xl font-bold tracking-tight">Labs · Checklist de trucos</h1>
        <p className="max-w-3xl text-base leading-7 text-deck-200">
          Visualiza tu progreso general y por categoría. Puedes actualizar el estado de cada truco sin salir de la
          pantalla.
        </p>

        <div className="space-y-3 rounded-lg border border-deck-600 bg-deck-900/60 p-4">
          <h2 className="text-lg font-semibold">Resumen general</h2>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-deck-700">
            {statusOrder.map((status) => {
              const width = globalStats.totalTricks ? (globalStats.totals[status] / globalStats.totalTricks) * 100 : 0;
              return <span key={status} className={`block h-full ${statusSegmentStyles[status]}`} style={{ width: `${width}%` }} />;
            })}
          </div>
          <p className="text-sm text-deck-100">
            Completado: <strong>{globalStats.completionPercent}%</strong> ({globalStats.totals['lo-tengo']} de{' '}
            {globalStats.totalTricks} trucos).
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-deck-200">
            {statusOrder.map((status) => (
              <span key={status} className="inline-flex items-center gap-2 rounded-full border border-deck-600 px-3 py-1">
                <span className={`h-2.5 w-2.5 rounded-full ${statusSegmentStyles[status]}`} />
                {statusLabels[status]}: {globalStats.totals[status]}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-deck-600 bg-deck-900/60 p-4">
          <h2 className="text-lg font-semibold">Avance por categoría</h2>
          <div className="space-y-3">
            {categoryCompletion.map((category) => (
              <div key={category.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-deck-100">{category.title}</span>
                  <span className="text-deck-200">{category.completionPercent}% completado</span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-deck-700">
                  {statusOrder.map((status) => {
                    const width = category.totalTricks ? (category.totals[status] / category.totalTricks) * 100 : 0;
                    return (
                      <span key={status} className={`block h-full ${statusSegmentStyles[status]}`} style={{ width: `${width}%` }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-5">
        {categoryStats.map((category) => (
          <article key={category.id} className="rounded-xl border border-deck-700 bg-deck-800 p-5">
            <div className="mb-4 space-y-3">
              <h2 className="text-2xl font-semibold">{category.title}</h2>

              <div className="space-y-2">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-deck-700">
                  {statusOrder.map((status) => {
                    const width = category.totalTricks ? (category.totals[status] / category.totalTricks) * 100 : 0;
                    return (
                      <span key={status} className={`block h-full ${statusSegmentStyles[status]}`} style={{ width: `${width}%` }} />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-deck-200">
                  {statusOrder.map((status) => {
                    const percent = category.totalTricks
                      ? Math.round((category.totals[status] / category.totalTricks) * 100)
                      : 0;

                    return (
                      <span
                        key={status}
                        className="inline-flex items-center gap-2 rounded-full border border-deck-600 px-3 py-1"
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${statusSegmentStyles[status]}`} />
                        {statusLabels[status]}: {category.totals[status]} ({percent}%)
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {category.tricks.map((trick) => {
                const selectedStatus = statusByTrick[trick.id] ?? statusDefault;
                return (
                  <div key={trick.id} className="rounded-lg border border-deck-700 bg-deck-900/60 p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{trick.name}</h3>
                        <p className="text-sm text-deck-200">Dificultad: {trick.difficulty}</p>
                      </div>
                      <span className="rounded-full border border-deck-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-deck-100">
                        {statusLabels[selectedStatus]}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {(Object.keys(statusLabels) as TrickStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateStatus(trick.id, status)}
                          className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                            selectedStatus === status
                              ? statusButtonStyles[status]
                              : 'border-deck-700 bg-deck-900 text-deck-200 hover:border-deck-500'
                          }`}
                        >
                          {statusLabels[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
