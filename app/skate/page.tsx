'use client';

import { useEffect, useMemo, useState } from 'react';

type Player = {
  id: string;
  name: string;
  letterCount: number; // 0–5
  eliminated: boolean;
};

type RoundResult = 'CAYÓ' | 'LO LOGRÓ';
type RoundState = 'awaiting_setter_attempt' | 'awaiting_defenders' | 'round_complete';

type HistoryEvent =
  | { type: 'set_attempt'; trick: string; player: string; result: RoundResult }
  | { type: 'defense_attempt'; trick: string; player: string; result: RoundResult }
  | { type: 'letter_assigned'; player: string; letter: string; reason: 'set_attempt' | 'defense_attempt' }
  | { type: 'round_closed'; trick: string; nextSetter: string };

type GameState = {
  players: Player[];
  turnOrder: string[]; // player ids in order
  currentTurnIndex: number; // index in turnOrder
  currentTrick: string;
  roundState: RoundState;
  setterPlayerId: string;
  defenderQueue: string[];
  currentDefenderIndex: number;
  trickCatalogUsed: string[];
  history: HistoryEvent[];
};

type Phase = 'setup' | 'order' | 'starting' | 'play';

const LETTERS = ['S', 'K', 'A', 'T', 'E'] as const;
const STORAGE_KEY = 'patineto-skate-rapid-v1';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createPlayer = (name: string): Player => ({
  id: createId(),
  name: name.trim(),
  letterCount: 0,
  eliminated: false,
});

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const clampLetterCount = (value: number) => Math.max(0, Math.min(5, value));

const lettersForCount = (count: number) =>
  LETTERS.map((letter, index) => (index < count ? letter : '_')).join(' ');

export default function SkatePage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentTrick, setCurrentTrick] = useState('Ollie');
  const [roundState, setRoundState] = useState<RoundState>('awaiting_setter_attempt');
  const [setterPlayerId, setSetterPlayerId] = useState('');
  const [defenderQueue, setDefenderQueue] = useState<string[]>([]);
  const [currentDefenderIndex, setCurrentDefenderIndex] = useState(0);
  const [trickCatalogUsed, setTrickCatalogUsed] = useState<string[]>([]);
  const [history, setHistory] = useState<GameState['history']>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isEditingTrick, setIsEditingTrick] = useState(false);
  const [trickDraft, setTrickDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [startingPlayerName, setStartingPlayerName] = useState('');
  const [rpsLabel, setRpsLabel] = useState('Piedra...');

  const playersById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  const activeTurnOrder = useMemo(
    () =>
      turnOrder.filter((playerId) => {
        const player = playersById.get(playerId);
        return Boolean(player && !player.eliminated);
      }),
    [playersById, turnOrder],
  );

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        phase?: Phase;
        game?: GameState;
      };

      const safePlayers = Array.isArray(parsed.game?.players)
        ? parsed.game.players.map((player, index) => ({
            id: player.id || createId(),
            name: player.name?.trim() || `Player ${index + 1}`,
            letterCount: clampLetterCount(Number(player.letterCount) || 0),
            eliminated: Boolean(player.eliminated) || clampLetterCount(Number(player.letterCount) || 0) >= 5,
          }))
        : [];

      const safeTurnOrder = Array.isArray(parsed.game?.turnOrder) ? parsed.game.turnOrder.filter(Boolean) : [];
      const persistedSetter = parsed.game?.setterPlayerId ?? safeTurnOrder[0] ?? '';

      setPlayers(safePlayers);
      setTurnOrder(safeTurnOrder);
      setCurrentTurnIndex(Math.max(0, Number(parsed.game?.currentTurnIndex) || 0));
      setCurrentTrick(typeof parsed.game?.currentTrick === 'string' ? parsed.game.currentTrick : 'Ollie');
      setRoundState(parsed.game?.roundState ?? 'awaiting_setter_attempt');
      setSetterPlayerId(persistedSetter);
      setDefenderQueue(Array.isArray(parsed.game?.defenderQueue) ? parsed.game.defenderQueue.filter(Boolean) : []);
      setCurrentDefenderIndex(Math.max(0, Number(parsed.game?.currentDefenderIndex) || 0));
      setTrickCatalogUsed(Array.isArray(parsed.game?.trickCatalogUsed) ? parsed.game.trickCatalogUsed : []);
      setHistory(Array.isArray(parsed.game?.history) ? parsed.game.history : []);

      if (parsed.phase && ['setup', 'order', 'starting', 'play'].includes(parsed.phase)) {
        setPhase(parsed.phase);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const game: GameState = {
      players,
      turnOrder,
      currentTurnIndex,
      currentTrick,
      roundState,
      setterPlayerId,
      defenderQueue,
      currentDefenderIndex,
      trickCatalogUsed,
      history,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phase,
        game,
      }),
    );
  }, [
    phase,
    players,
    turnOrder,
    currentTurnIndex,
    currentTrick,
    roundState,
    setterPlayerId,
    defenderQueue,
    currentDefenderIndex,
    trickCatalogUsed,
    history,
  ]);

  useEffect(() => {
    if (phase !== 'starting') return;
    if (!turnOrder.length) return;

    const sequence = ['Piedra...', 'Papel...', 'Tijera...'];
    sequence.forEach((label, index) => {
      setTimeout(() => setRpsLabel(label), index * 450);
    });

    const finalTimeout = setTimeout(() => {
      const randomId = turnOrder[Math.floor(Math.random() * turnOrder.length)];
      const starterIndex = turnOrder.findIndex((id) => id === randomId);
      const starterName = playersById.get(randomId)?.name || 'Jugador';
      setCurrentTurnIndex(Math.max(0, starterIndex));
      setSetterPlayerId(randomId);
      setStartingPlayerName(starterName);
      setRpsLabel('¡Listo!');

      setTimeout(() => {
        setPhase('play');
      }, 1000);
    }, 1500);

    return () => {
      clearTimeout(finalTimeout);
    };
  }, [phase, turnOrder, playersById]);

  const setterPlayer = setterPlayerId ? playersById.get(setterPlayerId) ?? null : null;
  const activeDefenderId = defenderQueue[currentDefenderIndex] ?? null;
  const activeDefender = activeDefenderId ? playersById.get(activeDefenderId) ?? null : null;

  const nextPlayerPreview = useMemo(() => {
    if (!activeTurnOrder.length || !setterPlayerId) return null;
    const indexInActive = activeTurnOrder.findIndex((id) => id === setterPlayerId);
    const nextId = activeTurnOrder[(indexInActive + 1) % activeTurnOrder.length] ?? activeTurnOrder[0];
    return playersById.get(nextId) ?? null;
  }, [activeTurnOrder, setterPlayerId, playersById]);

  const remainingPlayers = useMemo(() => players.filter((player) => !player.eliminated), [players]);

  const getLetterForCount = (count: number) => LETTERS[Math.max(0, Math.min(count - 1, LETTERS.length - 1))] ?? LETTERS[0];

  const getActiveIds = (allPlayers: Player[]) =>
    turnOrder.filter((id) => {
      const player = allPlayers.find((item) => item.id === id);
      return Boolean(player && !player.eliminated);
    });

  const getNextActiveId = (fromPlayerId: string, allPlayers: Player[]) => {
    const aliveIds = getActiveIds(allPlayers);
    if (!aliveIds.length) return '';
    if (aliveIds.length === 1) return aliveIds[0];
    const currentAliveIndex = aliveIds.findIndex((id) => id === fromPlayerId);
    return aliveIds[(currentAliveIndex + 1) % aliveIds.length] ?? aliveIds[0];
  };

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers((prev) => [...prev, createPlayer(name)]);
    setNewPlayerName('');
  };

  const updatePlayer = (id: string, name: string) => {
    setPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, name } : player)));
  };

  const commitPlayerName = (id: string, index: number) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, name: player.name.trim() || `Player ${index + 1}` } : player,
      ),
    );
  };

  const closeRound = (trickUsed: string) => {
    const nextSetterId = getNextActiveId(setterPlayerId, players);
    const nextSetterIndex = turnOrder.findIndex((id) => id === nextSetterId);
    const nextSetterName = playersById.get(nextSetterId)?.name || 'Jugador';

    setSetterPlayerId(nextSetterId);
    setCurrentTurnIndex(Math.max(0, nextSetterIndex));
    setDefenderQueue([]);
    setCurrentDefenderIndex(0);
    setRoundState('round_complete');
    setHistory((prev) => [...prev, { type: 'round_closed', trick: trickUsed, nextSetter: nextSetterName }]);
  };

  const assignLetter = (targetPlayerId: string, reason: 'set_attempt' | 'defense_attempt') => {
    let assignedLetter = LETTERS[0];
    let targetName = 'Jugador';

    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id !== targetPlayerId) return player;

        targetName = player.name;
        const nextCount = clampLetterCount(player.letterCount + 1);
        assignedLetter = getLetterForCount(nextCount);

        return {
          ...player,
          letterCount: nextCount,
          eliminated: nextCount >= 5,
        };
      }),
    );

    setHistory((prev) => [...prev, { type: 'letter_assigned', player: targetName, letter: assignedLetter, reason }]);
  };

  const recordSetterAttempt = (success: boolean, trickName: string) => {
    if (!setterPlayer) return;

    const normalizedTrick = trickName.trim() || 'Truco libre';
    const result: RoundResult = success ? 'LO LOGRÓ' : 'CAYÓ';

    setCurrentTrick(normalizedTrick);
    setHistory((prev) => [...prev, { type: 'set_attempt', trick: normalizedTrick, player: setterPlayer.name, result }]);

    if (!success) {
      assignLetter(setterPlayer.id, 'set_attempt');
      closeRound(normalizedTrick);
      return;
    }

    setTrickCatalogUsed((prev) => (prev.includes(normalizedTrick) ? prev : [...prev, normalizedTrick]));

    const defenders = activeTurnOrder.filter((id) => id !== setterPlayer.id);
    setDefenderQueue(defenders);
    setCurrentDefenderIndex(0);

    if (!defenders.length) {
      closeRound(normalizedTrick);
      return;
    }

    setRoundState('awaiting_defenders');
  };

  const recordDefenseAttempt = (success: boolean) => {
    if (!activeDefender) return;

    const result: RoundResult = success ? 'LO LOGRÓ' : 'CAYÓ';
    setHistory((prev) => [...prev, { type: 'defense_attempt', trick: currentTrick, player: activeDefender.name, result }]);

    if (!success) {
      assignLetter(activeDefender.id, 'defense_attempt');
    }

    const nextIndex = currentDefenderIndex + 1;
    if (nextIndex >= defenderQueue.length) {
      closeRound(currentTrick);
      return;
    }

    setCurrentDefenderIndex(nextIndex);
  };

  const openNextRound = () => {
    if (roundState !== 'round_complete') return;
    setCurrentTrick('Truco libre');
    setTrickDraft('');
    setRoundState('awaiting_setter_attempt');
  };

  const startGame = () => {
    if (players.length < 2) return;
    const cleanPlayers = players.map((player, index) => ({
      ...player,
      name: player.name.trim() || `Player ${index + 1}`,
      letterCount: 0,
      eliminated: false,
    }));

    const order = shuffle(cleanPlayers.map((player) => player.id));

    setPlayers(cleanPlayers);
    setTurnOrder(order);
    setCurrentTurnIndex(0);
    setCurrentTrick('Ollie');
    setRoundState('awaiting_setter_attempt');
    setSetterPlayerId(order[0] ?? '');
    setDefenderQueue([]);
    setCurrentDefenderIndex(0);
    setTrickCatalogUsed([]);
    setTrickDraft('Ollie');
    setHistory([]);
    setHistoryOpen(false);
    setPhase('order');

    setTimeout(() => {
      setPhase('starting');
    }, 900);
  };

  const resetRound = () => {
    setPlayers((prev) => prev.map((player) => ({ ...player, letterCount: 0, eliminated: false })));
    setCurrentTurnIndex(0);
    setCurrentTrick('Ollie');
    setRoundState('awaiting_setter_attempt');
    setSetterPlayerId(turnOrder[0] ?? '');
    setDefenderQueue([]);
    setCurrentDefenderIndex(0);
    setTrickCatalogUsed([]);
    setTrickDraft('Ollie');
    setHistory([]);
    setPhase(turnOrder.length ? 'play' : 'setup');
  };

  const newGame = () => {
    setPhase('setup');
    setPlayers([]);
    setTurnOrder([]);
    setCurrentTurnIndex(0);
    setCurrentTrick('Ollie');
    setRoundState('awaiting_setter_attempt');
    setSetterPlayerId('');
    setDefenderQueue([]);
    setCurrentDefenderIndex(0);
    setTrickCatalogUsed([]);
    setTrickDraft('');
    setHistory([]);
    setNewPlayerName('');
    setHistoryOpen(false);
    setStartingPlayerName('');
    setRpsLabel('Piedra...');
    localStorage.removeItem(STORAGE_KEY);
  };

  const gameHasWinner = phase === 'play' && remainingPlayers.length === 1;
  const winner = gameHasWinner ? remainingPlayers[0] : null;

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8">
      {phase === 'setup' && (
        <div className="space-y-5">
          <h1 className="text-center text-3xl font-black">Juego de S.K.A.T.E</h1>
          <p className="text-center text-sm text-deck-300">Agrega al menos 2 jugadores para comenzar.</p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newPlayerName}
              onChange={(event) => setNewPlayerName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addPlayer();
                }
              }}
              placeholder="Nombre del jugador"
              className="w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addPlayer}
              className="rounded-lg border border-indigo-400/40 bg-indigo-500/20 px-4 py-2 font-semibold text-indigo-100"
            >
              Añadir
            </button>
          </div>

          <div className="space-y-2">
            {players.map((player, index) => (
              <input
                key={player.id}
                type="text"
                value={player.name}
                onChange={(event) => updatePlayer(player.id, event.target.value)}
                onBlur={() => commitPlayerName(player.id, index)}
                className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            disabled={players.length < 2}
            className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-lg font-bold text-white disabled:opacity-40"
          >
            Iniciar juego
          </button>
        </div>
      )}

      {phase === 'order' && (
        <div className="space-y-5 text-center">
          <h2 className="text-2xl font-bold">Orden de turnos</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {turnOrder.map((playerId, index) => (
              <span key={playerId} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
                {index + 1}. {playersById.get(playerId)?.name}
              </span>
            ))}
          </div>
          <p className="text-sm text-deck-300">Preparando quién empieza...</p>
        </div>
      )}

      {phase === 'starting' && (
        <div className="space-y-5 text-center">
          <h2 className="text-2xl font-bold">Piedra, papel o tijera</h2>
          <p className="text-3xl font-extrabold text-hype-cyan">{rpsLabel}</p>
          <p className="text-lg font-semibold">Empieza: {startingPlayerName || '...'}</p>
        </div>
      )}

      {phase === 'play' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center text-xs sm:text-sm">
            <div className="flex flex-wrap justify-center gap-2">
              {turnOrder.map((playerId) => {
                const player = playersById.get(playerId);
                if (!player) return null;

                const severityClass = player.eliminated
                  ? 'opacity-40'
                  : player.letterCount >= 4
                    ? 'text-red-300'
                    : player.letterCount >= 2
                      ? 'text-amber-300'
                      : 'text-white';

                return (
                  <span key={`status-${player.id}`} className={severityClass}>
                    {player.name}: {lettersForCount(player.letterCount)}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Turno actual</p>
            <h2 className="text-4xl font-black">{winner ? `🏆 ${winner.name}` : setterPlayer?.name || 'Sin jugador'}</h2>
            {!winner && nextPlayerPreview && <p className="text-sm text-white/70">Siguiente: ↻ {nextPlayerPreview.name}</p>}
          </div>

          {!winner && (
            <>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="text-sm font-semibold text-hype-cyan">
                  {roundState === 'awaiting_setter_attempt' && `${setterPlayer?.name || 'Jugador'} intenta setear`}
                  {roundState === 'awaiting_defenders' &&
                    `${activeDefender?.name || 'Jugador'} responde truco ${currentTrick || 'TRUCO LIBRE'}`}
                  {roundState === 'round_complete' && 'Ronda terminada: pedir nuevo truco'}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Truco actual</p>
                <p className="mt-1 text-3xl font-bold uppercase">{currentTrick || 'TRUCO LIBRE'}</p>

                {!isEditingTrick ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTrickDraft(currentTrick);
                      setIsEditingTrick(true);
                    }}
                    className="mt-3 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold"
                  >
                    Editar truco actual
                  </button>
                ) : (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={trickDraft}
                      onChange={(event) => setTrickDraft(event.target.value)}
                      placeholder="Escribe el truco"
                      className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTrick(trickDraft.trim() || 'Truco libre');
                        setIsEditingTrick(false);
                      }}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              {roundState === 'awaiting_setter_attempt' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => recordSetterAttempt(false, trickDraft || currentTrick)}
                    className="rounded-xl bg-red-500 px-4 py-5 text-xl font-black text-white"
                  >
                    SETTER CAYÓ
                  </button>
                  <button
                    type="button"
                    onClick={() => recordSetterAttempt(true, trickDraft || currentTrick)}
                    className="rounded-xl bg-emerald-500 px-4 py-5 text-xl font-black text-white"
                  >
                    SETTER LOGRÓ
                  </button>
                </div>
              )}

              {roundState === 'awaiting_defenders' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => recordDefenseAttempt(false)}
                    className="rounded-xl bg-red-500 px-4 py-5 text-xl font-black text-white"
                  >
                    DEFENSA CAYÓ
                  </button>
                  <button
                    type="button"
                    onClick={() => recordDefenseAttempt(true)}
                    className="rounded-xl bg-emerald-500 px-4 py-5 text-xl font-black text-white"
                  >
                    DEFENSA LOGRÓ
                  </button>
                </div>
              )}

              {roundState === 'round_complete' && (
                <button
                  type="button"
                  onClick={openNextRound}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-5 text-xl font-black text-white"
                >
                  Pedir nuevo truco
                </button>
              )}
            </>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={resetRound}
              className="rounded-lg bg-yellow-400 px-4 py-3 font-semibold text-black"
            >
              Reiniciar ronda
            </button>
            <button
              type="button"
              onClick={newGame}
              className="rounded-lg border border-red-500 px-4 py-3 font-semibold text-red-400"
            >
              Nueva partida
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25">
            <button
              type="button"
              onClick={() => setHistoryOpen((prev) => !prev)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
            >
              Historial rápido
              <span>{historyOpen ? '−' : '+'}</span>
            </button>

            {historyOpen && (
              <ul className="space-y-1 border-t border-white/10 px-4 py-3 text-sm text-white/80">
                {history.length === 0 && <li>No hay rondas todavía.</li>}
                {history.map((item, index) => (
                  <li key={`${item.type}-${index}`}>
                    {item.type === 'set_attempt' &&
                      `E${index + 1}: [SET] ${item.trick} — ${item.player} ${item.result}`}
                    {item.type === 'defense_attempt' &&
                      `E${index + 1}: [DEF] ${item.trick} — ${item.player} ${item.result}`}
                    {item.type === 'letter_assigned' &&
                      `E${index + 1}: [LETRA] ${item.player} recibe ${item.letter} (${item.reason})`}
                    {item.type === 'round_closed' &&
                      `E${index + 1}: [CIERRE] ${item.trick} · Próximo setter: ${item.nextSetter}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
