export default function DicePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-deck-200">Módulo</p>
        <h1 className="text-3xl font-bold tracking-tight">Juego de Dados</h1>
      </header>

      <div className="rounded-xl border border-deck-700 bg-deck-800 p-6">
        <h2 className="text-xl font-semibold">Copy temporal</h2>
        <p className="mt-3 leading-7 text-deck-200">
          Esta vista servirá para definir dados con trucos y variaciones, manejo de turnos y validación de aciertos. En
          esta fase solo dejamos la estructura visual base.
        </p>
      </div>
    </section>
  );
}
