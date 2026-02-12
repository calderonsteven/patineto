export default function ProfilePage() {
  return (
    <section className="space-y-6">
      <header className="neo-panel space-y-2 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-hype-purple">Módulo futuro</p>
        <h1 className="text-3xl font-black tracking-tight">Perfil y estadísticas</h1>
      </header>

      <div className="neo-panel border-dashed p-6">
        <h2 className="text-xl font-semibold">Próximamente</h2>
        <p className="mt-3 leading-7 text-deck-300">
          Aquí irá el resumen de progreso del rider: partidas jugadas, mejores rachas, trucos favoritos y retos.
        </p>
      </div>
    </section>
  );
}
