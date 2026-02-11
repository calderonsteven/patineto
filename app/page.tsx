import { GameCard } from '@/components/game-card';

const games = [
  {
    title: 'Juego de S.K.A.T.E',
    description:
      'Lleva el tracking de trucos, turnos y letras por skater. Esta primera versión solo muestra estructura y copys.',
    href: '/skate',
    status: 'Diseño' as const,
  },
  {
    title: 'Juego de Dados',
    description:
      'Cada dado tendrá trucos y variaciones. Aquí preparamos la ruta y la narrativa base para diseñarlo en la siguiente fase.',
    href: '/dice',
    status: 'Diseño' as const,
  },
  {
    title: 'Perfil y stats',
    description:
      'Módulo futuro para ver progreso, historial y retos entre amigos. Por ahora queda como vista placeholder.',
    href: '/profile',
    status: 'Próximamente' as const,
  },
];

export default function HomePage() {
  return (
    <section className="space-y-10">
      <header className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Patineto · Beta</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Escoge tu juego</h1>
        <p className="text-base leading-7 text-deck-200 sm:text-lg">
          Esta versión inicial define rutas, diseño y estructura de mini-apps. La lógica real de los juegos se
          implementará en la siguiente fase.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.href} {...game} />
        ))}
      </div>
    </section>
  );
}
