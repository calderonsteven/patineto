import Link from 'next/link';

type GameCardProps = {
  title: string;
  description: string;
  href: string;
  status: 'Diseño' | 'Activo' | 'Próximamente';
};

export function GameCard({ title, description, href, status }: GameCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-deck-700 bg-deck-800 p-6 shadow-lg shadow-black/20">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-deck-700 px-3 py-1 text-xs font-medium text-deck-200">
          {status}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-6 text-deck-200">{description}</p>
      </div>

      <Link
        href={href}
        className="mt-6 inline-flex w-fit rounded-md bg-white px-4 py-2 text-sm font-semibold text-deck-900 transition hover:bg-deck-200"
      >
        Ir al módulo
      </Link>
    </article>
  );
}
