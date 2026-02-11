export default function ProfilePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Módulo futuro</p>
        <h1 className="text-3xl font-bold tracking-tight">Perfil y estadísticas</h1>
      </header>

      <div className="rounded-xl border border-dashed border-deck-700 bg-deck-800 p-6">
        <h2 className="text-xl font-semibold">Próximamente</h2>
        <p className="mt-3 leading-7 text-deck-200">
          Aquí irá el resumen de progreso del rider: partidas jugadas, mejores rachas, trucos favoritos y retos.
        </p>
      </div>
    </section>
  );
}
