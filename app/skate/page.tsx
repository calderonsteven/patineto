'use client';

import { TrickVideo } from '@/components/youtube/trick-video';
import { useEffect, useMemo, useState } from 'react';

type Player = {
  id: string;
  name: string;
  letterCount: number;
  eliminated?: boolean;
};

const LETTERS = ['S', 'K', 'A', 'T', 'E'] as const;
const PLAYERS_STORAGE_KEY = 'patineto-skate-players';

const createPlayer = (name: string): Player => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  name,
  letterCount: 0,
  eliminated: false,
});

const getSafePlayerName = (value: string, fallbackIndex: number) => value.trim() || `Player ${fallbackIndex + 1}`;

export default function SkatePage() {
  const [players, setPlayers] = useState<Player[]>([createPlayer('Player 1'), createPlayer('Player 2')]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [trickInput, setTrickInput] = useState('');
  const [currentTrick, setCurrentTrick] = useState('');
  const [trickHistory, setTrickHistory] = useState<string[]>([]);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [lastFailedPlayerId, setLastFailedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(PLAYERS_STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Player[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return;
      }

      const hydratedPlayers = parsed.map((player, index) => ({
        id: player.id || createPlayer('').id,
        name: getSafePlayerName(player.name || '', index),
        letterCount: Number.isFinite(player.letterCount) ? Math.min(Math.max(player.letterCount, 0), 5) : 0,
        eliminated: Boolean(player.eliminated),
      }));

      setPlayers(hydratedPlayers);
      setCurrentPlayerIndex(0);
    } catch {
      // Ignore invalid localStorage value.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (!lastFailedPlayerId) {
      return;
    }

    const timeout = setTimeout(() => {
      setLastFailedPlayerId(null);
    }, 550);

    return () => clearTimeout(timeout);
  }, [lastFailedPlayerId]);

  const activePlayers = useMemo(() => players.filter((player) => !player.eliminated), [players]);

  const currentPlayer = activePlayers[currentPlayerIndex] ?? null;

  const alivePlayers = useMemo(() => activePlayers.filter((player) => player.letterCount < 5), [activePlayers]);

  const sortedByRisk = useMemo(
    () => [...activePlayers].sort((a, b) => b.letterCount - a.letterCount || a.name.localeCompare(b.name)),
    [activePlayers],
  );

  const trickAlreadyUsed = useMemo(
    () => trickInput.trim().length > 0 && trickHistory.some((trick) => trick.toLowerCase() === trickInput.trim().toLowerCase()),
    [trickHistory, trickInput],
  );

  useEffect(() => {
    if (activePlayers.length === 0) {
      setWinnerId(null);
      return;
    }

    if (alivePlayers.length === 1 && players.length >= 2) {
      setWinnerId(alivePlayers[0].id);
      setGameStarted(true);
      return;
    }

    setWinnerId(null);
  }, [alivePlayers, activePlayers.length, players.length]);

  useEffect(() => {
    if (currentPlayerIndex <= activePlayers.length - 1) {
      return;
    }

    setCurrentPlayerIndex(activePlayers.length > 0 ? 0 : 0);
  }, [activePlayers.length, currentPlayerIndex]);

  const canStartRound = activePlayers.length >= 2;

  const addPlayer = () => {
    const cleanName = getSafePlayerName(newPlayerName, players.length);
    setPlayers((prev) => [...prev, createPlayer(cleanName)]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
    setCurrentPlayerIndex(0);
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, name } : player)));
  };

  const commitPlayerName = (id: string) => {
    setPlayers((prev) =>
      prev.map((player, index) =>
        player.id === id ? { ...player, name: getSafePlayerName(player.name, index) } : player,
      ),
    );
  };

  const nextTurn = () => {
    if (activePlayers.length <= 1 || winnerId) {
      return;
    }

    setGameStarted(true);
    setCurrentPlayerIndex((prev) => (prev + 1) % activePlayers.length);
  };

  const failCurrentPlayer = () => {
    if (!currentPlayer || winnerId) {
      return;
    }

    setGameStarted(true);
    setLastFailedPlayerId(currentPlayer.id);

    setPlayers((prev) => {
      const updated = prev.map((player) => {
        if (player.id !== currentPlayer.id) {
          return player;
        }

        const newCount = Math.min(player.letterCount + 1, 5);
        const reachesSkate = newCount >= 5;

        return {
          ...player,
          letterCount: newCount,
          eliminated: eliminationMode ? reachesSkate : player.eliminated,
        };
      });

      return updated;
    });

    const projectedPlayers = players.map((player) => {
      if (player.id !== currentPlayer.id) {
        return player;
      }

      const nextCount = Math.min(player.letterCount + 1, 5);
      return {
        ...player,
        letterCount: nextCount,
        eliminated: eliminationMode ? nextCount >= 5 : player.eliminated,
      };
    });

    const projectedActive = projectedPlayers.filter((player) => !player.eliminated);

    if (projectedActive.length > 1) {
      const currentIndex = projectedActive.findIndex((player) => player.id === currentPlayer.id);
      if (currentIndex >= 0) {
        setCurrentPlayerIndex((currentIndex + 1) % projectedActive.length);
      } else {
        setCurrentPlayerIndex(currentPlayerIndex % projectedActive.length);
      }
    } else {
      setCurrentPlayerIndex(0);
    }
  };

  const submitTrick = () => {
    const cleanTrick = trickInput.trim();

    if (!cleanTrick) {
      return;
    }

    setCurrentTrick(cleanTrick);
    setTrickHistory((prev) => [...prev, cleanTrick]);
    setGameStarted(true);
  };

  const resetGameKeepPlayers = () => {
    setPlayers((prev) => prev.map((player) => ({ ...player, letterCount: 0, eliminated: false })));
    setCurrentPlayerIndex(0);
    setCurrentTrick('');
    setTrickInput('');
    setTrickHistory([]);
    setGameStarted(false);
    setWinnerId(null);
    setLastFailedPlayerId(null);
  };

  const newGame = () => {
    setPlayers([]);
    setNewPlayerName('');
    setCurrentPlayerIndex(0);
    setCurrentTrick('');
    setTrickInput('');
    setTrickHistory([]);
    setGameStarted(false);
    setWinnerId(null);
    setLastFailedPlayerId(null);
    setEliminationMode(false);
    localStorage.removeItem(PLAYERS_STORAGE_KEY);
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10">
      <header className="neo-panel space-y-2 p-5 text-center sm:p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-hype-pink">Módulo</p>
        <h1 className="text-3xl font-black tracking-tight">Juego de S.K.A.T.E</h1>
        <p className="text-sm text-deck-300">Multijugador local: agrega nombres y juega por turnos.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <article className="neo-panel space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Jugadores</h2>
              <span className="text-xs text-deck-300">Mínimo 2 para jugar</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={newPlayerName}
                onChange={(event) => setNewPlayerName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addPlayer();
                  }
                }}
                placeholder="Añadir jugador"
                className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-deck-300 focus:border-hype-cyan focus:outline-none"
              />
              <button
                type="button"
                onClick={addPlayer}
                className="rounded-md border border-hype-cyan/40 bg-hype-cyan/15 px-4 py-2 text-sm font-semibold text-hype-cyan transition hover:bg-hype-cyan/25"
              >
                Añadir
              </button>
            </div>

            <ul className="space-y-2">
              {players.length === 0 && <li className="text-sm text-deck-300">No hay jugadores todavía.</li>}
              {players.map((player, index) => {
                const isActive = currentPlayer?.id === player.id;
                const isWinner = winnerId === player.id;

                return (
                  <li
                    key={player.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                      isActive
                        ? 'border-hype-cyan bg-hype-cyan/10'
                        : 'border-white/10 bg-black/20'
                    } ${player.eliminated ? 'opacity-60' : ''}`}
                  >
                    <input
                      type="text"
                      value={player.name}
                      onChange={(event) => updatePlayerName(player.id, event.target.value)}
                      onBlur={() => commitPlayerName(player.id)}
                      className="w-full rounded bg-transparent px-1 py-1 text-sm font-medium text-white focus:bg-black/20 focus:outline-none"
                    />
                    {isWinner && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                        Winner
                      </span>
                    )}
                    {!gameStarted && players.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(player.id)}
                        className="rounded px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
                        aria-label={`Eliminar a ${player.name || `Player ${index + 1}`}`}
                      >
                        Quitar
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="neo-panel space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Truco actual</h2>
              {trickAlreadyUsed && <span className="text-xs text-amber-300">Ya se usó antes (warning)</span>}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="trick-name"
                type="text"
                value={trickInput}
                onChange={(event) => setTrickInput(event.target.value)}
                placeholder="Ejemplo: kickflip"
                className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-deck-300 focus:border-hype-cyan focus:outline-none"
              />
              <button
                type="button"
                onClick={submitTrick}
                className="rounded-md border border-hype-pink/50 bg-hype-pink/15 px-4 py-2 text-sm font-semibold text-hype-pink transition hover:bg-hype-pink/25"
              >
                {currentTrick ? 'Actualizar truco' : 'Guardar truco'}
              </button>
            </div>

            {currentTrick && <p className="text-sm text-deck-200">Jugando: {currentTrick}</p>}

            <TrickVideo trickName={trickInput || currentTrick} />

            {trickHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-deck-200">Historial de trucos</p>
                <div className="flex flex-wrap gap-2">
                  {trickHistory.map((trick, index) => (
                    <span key={`${trick}-${index}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-deck-200">
                      {trick}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-6">
          <article className="neo-panel space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Turno</h2>
              <label className="flex items-center gap-2 text-xs text-deck-300">
                <input
                  type="checkbox"
                  checked={eliminationMode}
                  onChange={(event) => setEliminationMode(event.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-black/20"
                />
                Elimination mode
              </label>
            </div>

            <p className="text-sm text-deck-300">
              {currentPlayer ? (
                <>
                  Turno actual:{' '}
                  <span className="font-semibold text-hype-cyan">{currentPlayer.name}</span>
                </>
              ) : (
                'Agrega jugadores para comenzar.'
              )}
            </p>

            <div className="space-y-2">
              {activePlayers.map((player, index) => {
                const isActive = currentPlayer?.id === player.id;
                const isFailed = lastFailedPlayerId === player.id;
                const isLeader = player.letterCount === Math.max(...activePlayers.map((item) => item.letterCount));

                return (
                  <div
                    key={player.id}
                    className={`rounded-lg border px-3 py-2 transition ${
                      isActive ? 'border-hype-cyan bg-hype-cyan/10' : 'border-white/10 bg-black/20'
                    } ${isFailed ? 'scale-[1.01] border-rose-300 bg-rose-500/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{index + 1}. {player.name}</p>
                      <div className="flex gap-1">
                        {isLeader && player.letterCount > 0 && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-200">
                            Leader
                          </span>
                        )}
                        {player.letterCount === 0 && (
                          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-sky-200">
                            Clean
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex gap-1 text-sm font-black tracking-[0.25em]">
                      {LETTERS.map((letter, idx) => (
                        <span
                          key={`${player.id}-${letter}`}
                          className={`transition-all duration-300 ${
                            idx < player.letterCount ? 'text-rose-300' : 'text-white/25'
                          }`}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={failCurrentPlayer}
                disabled={!canStartRound || !currentPlayer || Boolean(winnerId)}
                className="rounded-md border border-rose-400/50 bg-rose-500/20 px-3 py-2 text-sm font-semibold text-rose-200 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Fail current player
              </button>
              <button
                type="button"
                onClick={nextTurn}
                disabled={!canStartRound || !currentPlayer || Boolean(winnerId)}
                className="rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-hype-cyan disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next turn
              </button>
              <button
                type="button"
                onClick={resetGameKeepPlayers}
                className="rounded-md border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
              >
                Reset game (keep players)
              </button>
              <button
                type="button"
                onClick={newGame}
                className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                New game (clear everything)
              </button>
            </div>

            {winnerId && (
              <p className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                🎉 Ganador: {players.find((player) => player.id === winnerId)?.name}
              </p>
            )}
          </article>

          <article className="neo-panel space-y-3 p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Risk chart</h2>
            <div className="space-y-2">
              {sortedByRisk.map((player) => (
                <div key={`risk-${player.id}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{player.name}</span>
                    <span className="text-deck-300">{player.letterCount}/5</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-400 transition-all duration-300"
                      style={{ width: `${(player.letterCount / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
