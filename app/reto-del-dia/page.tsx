'use client';

import { useMemo, useState } from 'react';

type DemoState = 'inicio' | 'mitad' | 'completo';

type DailyChallenge = {
  title: string;
  description: string;
  goal: number;
  details: string;
};

const challenge: DailyChallenge = {
  title: 'Reto del Día',
  description: 'Consigue 10 aterrizajes de ollie hoy.',
  goal: 10,
  details:
    'Tip rápido: flexiona rodillas al caer y mantén los hombros alineados para aterrizar más estable.',
};

const demoStates: Record<DemoState, number> = {
  inicio: 0,
  mitad: 5,
  completo: challenge.goal,
};

export default function DailyChallengePage() {
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const completed = progress >= challenge.goal;
  const normalizedProgress = Math.min(progress, challenge.goal);
  const progressPercent = Math.round((normalizedProgress / challenge.goal) * 100);

  const helperMessage = useMemo(() => {
    if (completed) return '¡La constancia te está llevando al siguiente nivel!';
    if (progress === 0) return 'Empieza suave: un aterrizaje limpio marca el ritmo.';

    const remaining = challenge.goal - normalizedProgress;
    if (remaining <= 2) return '¡Ya casi! Un truco más y lo cierras.';
    return '¡Vas bien, sigue así!';
  }, [completed, progress, normalizedProgress]);

  const progressLabel = `${normalizedProgress} de ${challenge.goal}`;
  const skateboardPosition = `${progressPercent}%`;

  const markProgress = () => {
    setProgress((current) => Math.min(current + 1, challenge.goal));
  };

  const applyDemoState = (state: DemoState) => {
    setProgress(demoStates[state]);
    setShowDetails(state === 'completo');
  };

  const resetChallenge = () => {
    setProgress(0);
    setShowDetails(false);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.22em] text-hype-cyan">Demo interactiva</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{challenge.title}</h1>
        <p className="mx-auto max-w-xl text-lg text-deck-100">{challenge.description}</p>
      </header>

      <article className="neo-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-deck-200">
            <span>Progreso actual</span>
            <span className="font-semibold text-white">{progressLabel}</span>
          </div>

          <div className="relative h-4 overflow-hidden rounded-full bg-deck-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-hype-cyan transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="relative h-7" aria-hidden="true">
            <span
              className="absolute top-0 -translate-x-1/2 text-lg transition-all duration-300"
              style={{ left: skateboardPosition }}
            >
              🛹
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-hype-cyan">{helperMessage}</p>

        <button
          type="button"
          onClick={markProgress}
          disabled={completed}
          className="w-full rounded-lg bg-hype-pink px-5 py-4 text-base font-bold text-white transition hover:bg-hype-pink/90 disabled:cursor-not-allowed disabled:bg-emerald-500/60 disabled:text-white"
        >
          {completed ? '¡Completado!' : 'Marcar avance'}
        </button>

        {completed && (
          <div className="space-y-4 rounded-lg border border-emerald-400/50 bg-emerald-500/10 p-4 text-center">
            <p className="text-lg font-semibold text-emerald-200">¡Reto completado! 🎉</p>

            {showDetails && <p className="text-sm text-deck-100">{challenge.details}</p>}

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDetails((current) => !current)}
                className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
              >
                {showDetails ? 'Ocultar información' : 'Ver información adicional'}
              </button>
              <button
                type="button"
                onClick={resetChallenge}
                className="rounded-md border border-emerald-300/70 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200"
              >
                Resetear reto
              </button>
              <a
                href="/"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-deck-900 transition hover:bg-deck-100"
              >
                Volver a retos
              </a>
            </div>
          </div>
        )}
      </article>

      <section className="rounded-lg border border-deck-700 bg-deck-900/70 p-4">
        <p className="text-sm font-semibold text-deck-100">Estados de ejemplo (demo):</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => applyDemoState('inicio')}
            className="rounded-md border border-deck-600 px-3 py-2 text-sm text-deck-100 transition hover:border-deck-400"
          >
            Reto iniciado
          </button>
          <button
            type="button"
            onClick={() => applyDemoState('mitad')}
            className="rounded-md border border-deck-600 px-3 py-2 text-sm text-deck-100 transition hover:border-deck-400"
          >
            A mitad
          </button>
          <button
            type="button"
            onClick={() => applyDemoState('completo')}
            className="rounded-md border border-deck-600 px-3 py-2 text-sm text-deck-100 transition hover:border-deck-400"
          >
            Completado
          </button>
        </div>
      </section>
    </section>
  );
}
