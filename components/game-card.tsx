import Link from 'next/link';

type GameCardProps = {
  title: string;
  description: string;
  href: string;
  status: 'Diseño' | 'Activo' | 'Próximamente';
};

export function GameCard({ title, description, href, status }: GameCardProps) {
  return (
    <article className="neo-panel relative flex h-full flex-col justify-between overflow-hidden p-6 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-deck-300">
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
