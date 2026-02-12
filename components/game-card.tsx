import Link from 'next/link';

type GameCardProps = {
  title: string;
  description: string;
  href: string;
  status: 'Diseño' | 'Activo' | 'Nuevo' | 'Próximamente';
};

export function GameCard({ title, description, href, status }: GameCardProps) {
  const statusStyles = {
    Diseño: 'text-hype-purple border-hype-purple/40 bg-hype-purple/10',
    Activo: 'text-hype-cyan border-hype-cyan/40 bg-hype-cyan/10',
    Nuevo: 'text-emerald-300 border-emerald-300/40 bg-emerald-400/10',
    'Próximamente': 'text-hype-pink border-hype-pink/40 bg-hype-pink/10',
  };

  return (
    <article className="neo-panel relative flex h-full flex-col justify-between overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent">
      <div className="space-y-3">
        <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
          {status}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="text-sm leading-6 text-deck-300">{description}</p>
      </div>

      <Link href={href} className="neo-button mt-6 w-fit">
        Ir al módulo
      </Link>
    </article>
  );
}
