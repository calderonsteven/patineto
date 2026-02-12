'use client';

import { useEffect, useMemo, useState } from 'react';

type Player = {
  id: string;
  name: string;
  letterCount: number; // 0–5
  eliminated: boolean;
};

type RoundResult = 'CAYÓ' | 'LO LOGRÓ';

type GameState = {
  players: Player[];
  turnOrder: string[]; // player ids in order
  currentTurnIndex: number; // index in turnOrder
  currentTrick: string;
  history: { trick: string; player: string; result: RoundResult }[];
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
  const [history, setHistory] = useState<GameState['history']>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isEditingTrick, setIsEditingTrick] = useState(false);
  const [trickDraft, setTrickDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [startingPlayerName, setStartingPlayerName] = useState('');
  const [rpsLabel, setRpsLabel] = useState('Piedra...');

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

      setPlayers(safePlayers);
      setTurnOrder(Array.isArray(parsed.game?.turnOrder) ? parsed.game?.turnOrder.filter(Boolean) : []);
      setCurrentTurnIndex(Math.max(0, Number(parsed.game?.currentTurnIndex) || 0));
      setCurrentTrick(typeof parsed.game?.currentTrick === 'string' ? parsed.game.currentTrick : 'Ollie');
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
      history,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phase,
        game,
      }),
    );
  }, [phase, players, turnOrder, currentTurnIndex, currentTrick, history]);

  const playersById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  const activeTurnOrder = useMemo(
    () => turnOrder.filter((playerId) => {
      const player = playersById.get(playerId);
      return Boolean(player && !player.eliminated);
    }),
    [playersById, turnOrder],
  );

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

  const currentPlayerId = turnOrder[currentTurnIndex];
  const currentPlayer = currentPlayerId ? playersById.get(currentPlayerId) : null;

  const nextPlayerPreview = useMemo(() => {
    if (!activeTurnOrder.length || !currentPlayerId) return null;
    const indexInActive = activeTurnOrder.findIndex((id) => id === currentPlayerId);
    const nextId = activeTurnOrder[(indexInActive + 1) % activeTurnOrder.length] ?? activeTurnOrder[0];
    return playersById.get(nextId) ?? null;
  }, [activeTurnOrder, currentPlayerId, playersById]);

  const remainingPlayers = useMemo(() => players.filter((player) => !player.eliminated), [players]);

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
    setTrickDraft('Ollie');
    setHistory([]);
    setHistoryOpen(false);
    setPhase('order');

    setTimeout(() => {
      setPhase('starting');
    }, 900);
  };

  const moveToNextActivePlayer = (order: string[], fromPlayerId: string | undefined, allPlayers: Player[]) => {
    if (!fromPlayerId) {
      setCurrentTurnIndex(0);
      return;
    }

    const aliveIds = order.filter((id) => {
      const player = allPlayers.find((item) => item.id === id);
      return Boolean(player && !player.eliminated);
    });

    if (aliveIds.length <= 1) {
      const winnerId = aliveIds[0];
      const winnerIndex = winnerId ? order.findIndex((id) => id === winnerId) : 0;
      setCurrentTurnIndex(Math.max(0, winnerIndex));
      return;
    }

    const currentAliveIndex = aliveIds.findIndex((id) => id === fromPlayerId);
    const nextAliveId = aliveIds[(currentAliveIndex + 1) % aliveIds.length] ?? aliveIds[0];
    const globalIndex = order.findIndex((id) => id === nextAliveId);
    setCurrentTurnIndex(Math.max(0, globalIndex));
  };

  const applyTurnResult = (result: RoundResult) => {
    if (!currentPlayer) return;

    const beforePlayerName = currentPlayer.name;
    const trickUsed = currentTrick.trim() || 'Truco libre';

    setPlayers((prev) => {
      const updated = prev.map((player) => {
        if (player.id !== currentPlayer.id) return player;
        if (result !== 'CAYÓ') return player;

        const nextCount = clampLetterCount(player.letterCount + 1);
        return {
          ...player,
          letterCount: nextCount,
          eliminated: nextCount >= 5,
        };
      });

      moveToNextActivePlayer(turnOrder, currentPlayer.id, updated);
      return updated;
    });

    setHistory((prev) => [...prev, { trick: trickUsed, player: beforePlayerName, result }]);
  };

  const resetRound = () => {
    setPlayers((prev) => prev.map((player) => ({ ...player, letterCount: 0, eliminated: false })));
    setCurrentTurnIndex(0);
    setCurrentTrick('Ollie');
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
            <h2 className="text-4xl font-black">{winner ? `🏆 ${winner.name}` : currentPlayer?.name || 'Sin jugador'}</h2>
            {!winner && nextPlayerPreview && (
              <p className="text-sm text-white/70">Siguiente: ↻ {nextPlayerPreview.name}</p>
            )}
          </div>

          {!winner && (
            <>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => applyTurnResult('CAYÓ')}
                  className="rounded-xl bg-red-500 px-4 py-5 text-xl font-black text-white"
                >
                  CAYÓ
                </button>
                <button
                  type="button"
                  onClick={() => applyTurnResult('LO LOGRÓ')}
                  className="rounded-xl bg-emerald-500 px-4 py-5 text-xl font-black text-white"
                >
                  LO LOGRÓ
                </button>
              </div>
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
                  <li key={`${item.player}-${index}`}>
                    R{index + 1}: {item.trick} — {item.player} {item.result}
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
