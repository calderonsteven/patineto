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
      'Lanza los dados para generar retos de skate por dificultad, con selección de nivel y animación de resultado.',
    href: '/dice',
    status: 'Activo' as const,
  },
  {
    title: 'Labs · Trick checklist',
    description:
      'Checklist de trucos para marcar si lo quieres, lo practicas o ya lo tienes. Incluye preview visual y acciones de video.',
    href: '/labs',
    status: 'Nuevo' as const,
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
      <header className="neo-panel space-y-4 p-7">
        <p className="text-sm uppercase tracking-[0.24em] text-hype-cyan">Patineto</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Escoge tu juego</h1>
        <p className="text-base leading-7 text-deck-300 sm:text-lg">
          Por 🛹 para 🛹
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
