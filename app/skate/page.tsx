'use client';

import { TrickVideo } from '@/components/youtube/trick-video';
import { useEffect, useMemo, useState } from 'react';

type Player = {
  id: string;
  name: string;
  letterCount: number; // 0-5
};

type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  currentTrick: string;
  trickHistory: string[];
};

const LETTERS = ['S', 'K', 'A', 'T', 'E'] as const;
const STORAGE_KEY = 'patineto-skate-game-state-v2';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultPlayers = (): Player[] => [
  { id: createId(), name: 'Player 1', letterCount: 0 },
  { id: createId(), name: 'Player 2', letterCount: 0 },
];

const clamp = (value: number) => Math.max(0, Math.min(5, value));

export default function SkatePage() {
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentTrick, setCurrentTrick] = useState('');
  const [trickHistory, setTrickHistory] = useState<string[]>([]);
  const [trickDraft, setTrickDraft] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [lastFailedPlayerId, setLastFailedPlayerId] = useState<string | null>(null);

  const activePlayer = players[currentPlayerIndex] ?? null;

  const normalizedHistory = useMemo(
    () => new Set(trickHistory.map((trick) => trick.trim().toLowerCase())),
    [trickHistory],
  );

  const trickWasUsedBefore = useMemo(() => {
    const normalized = trickDraft.trim().toLowerCase();
    if (!normalized) return false;
    return normalizedHistory.has(normalized);
  }, [normalizedHistory, trickDraft]);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.letterCount - a.letterCount || a.name.localeCompare(b.name)),
    [players],
  );

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      const safePlayers = Array.isArray(parsed.players)
        ? parsed.players.map((player, index) => ({
            id: player.id || createId(),
            name: player.name?.trim() || `Player ${index + 1}`,
            letterCount: clamp(Number(player.letterCount) || 0),
          }))
        : [];

      setPlayers(safePlayers.length > 0 ? safePlayers : defaultPlayers());
      setCurrentPlayerIndex(
        safePlayers.length > 0
          ? Math.max(0, Math.min(Number(parsed.currentPlayerIndex) || 0, safePlayers.length - 1))
          : 0,
      );

      const trick = typeof parsed.currentTrick === 'string' ? parsed.currentTrick : '';
      setCurrentTrick(trick);
      setTrickDraft(trick);
      setTrickHistory(Array.isArray(parsed.trickHistory) ? parsed.trickHistory.filter(Boolean) : []);
    } catch {
      setPlayers(defaultPlayers());
      setCurrentPlayerIndex(0);
      setCurrentTrick('');
      setTrickDraft('');
      setTrickHistory([]);
    }
  }, []);

  useEffect(() => {
    const gameState: GameState = {
      players,
      currentPlayerIndex,
      currentTrick,
      trickHistory,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [players, currentPlayerIndex, currentTrick, trickHistory]);

  useEffect(() => {
    if (!players.length) return;
    if (currentPlayerIndex < players.length) return;
    setCurrentPlayerIndex(0);
  }, [currentPlayerIndex, players.length]);

  useEffect(() => {
    if (!lastFailedPlayerId) return;
    const timeout = setTimeout(() => setLastFailedPlayerId(null), 350);
    return () => clearTimeout(timeout);
  }, [lastFailedPlayerId]);

  const addPlayer = (name: string) => {
    const safeName = name.trim();
    if (!safeName) return;

    setPlayers((prev) => [...prev, { id: createId(), name: safeName, letterCount: 0 }]);
    setNewPlayerName('');
  };

  const editPlayer = (id: string, name: string) => {
    setPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, name } : player)));
  };

  const commitPlayerName = (id: string, fallbackIndex: number) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id
          ? { ...player, name: player.name.trim() || `Player ${fallbackIndex + 1}` }
          : player,
      ),
    );
  };

  const applyTrick = () => {
    const safeTrick = trickDraft.trim();
    if (!safeTrick) {
      setCurrentTrick('');
      return;
    }

    setCurrentTrick(safeTrick);
    setTrickHistory((prev) => {
      const normalized = safeTrick.toLowerCase();
      return prev.some((item) => item.trim().toLowerCase() === normalized) ? prev : [...prev, safeTrick];
    });
  };

  const failCurrentPlayer = () => {
    if (!players.length) return;

    const failedPlayer = players[currentPlayerIndex];
    if (!failedPlayer) return;

    setLastFailedPlayerId(failedPlayer.id);
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === failedPlayer.id ? { ...player, letterCount: clamp(player.letterCount + 1) } : player,
      ),
    );
  };

  const nextTurn = () => {
    if (players.length <= 1) return;
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

  const resetGame = () => {
    setPlayers((prev) => prev.map((player) => ({ ...player, letterCount: 0 })));
    setCurrentPlayerIndex(0);
    setCurrentTrick('');
    setTrickDraft('');
    setTrickHistory([]);
    setLastFailedPlayerId(null);
  };

  const newGame = () => {
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentTrick('');
    setTrickDraft('');
    setTrickHistory([]);
    setNewPlayerName('');
    setLastFailedPlayerId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <section className="max-w-xl mx-auto py-8 space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
        <h1 className="text-4xl font-bold text-center uppercase">{currentTrick || 'SET A TRICK'}</h1>

        {trickWasUsedBefore && (
          <p className="mx-auto w-fit rounded-full border border-amber-300/50 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
            This trick was used before
          </p>
        )}

        <input
          type="text"
          value={trickDraft}
          onChange={(event) => setTrickDraft(event.target.value)}
          onBlur={applyTrick}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              applyTrick();
            }
          }}
          placeholder="Type current trick and press Enter"
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <TrickVideo trickName={trickDraft || currentTrick} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-5">
        <div className="text-3xl font-semibold text-center mt-4">{activePlayer?.name || 'No players yet'}</div>

        <div className="flex justify-center space-x-2 text-xl">
          {LETTERS.map((letter, index) => {
            const owned = index < (activePlayer?.letterCount ?? 0);
            const animated = owned && lastFailedPlayerId === activePlayer?.id && index === (activePlayer?.letterCount ?? 0) - 1;

            return (
              <span
                key={`${activePlayer?.id ?? 'none'}-${letter}`}
                className={`w-9 h-11 rounded-md border flex items-center justify-center font-bold transition-all duration-300 ${
                  owned
                    ? 'border-rose-300/70 text-rose-200 bg-rose-500/20'
                    : 'border-white/10 text-white/30 bg-white/5'
                } ${animated ? 'scale-110' : 'scale-100'}`}
              >
                {letter}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={failCurrentPlayer}
            disabled={!activePlayer}
            className="w-full rounded-lg px-4 py-3 font-semibold bg-red-500 text-white disabled:opacity-40"
          >
            Fail
          </button>
          <button
            type="button"
            onClick={nextTurn}
            disabled={!activePlayer || players.length <= 1}
            className="w-full rounded-lg px-4 py-3 font-semibold bg-indigo-600 text-white disabled:opacity-40"
          >
            Next Turn
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="w-full rounded-lg px-4 py-3 font-semibold bg-yellow-400 text-black"
          >
            Reset Game (keep players)
          </button>
          <button
            type="button"
            onClick={newGame}
            className="w-full rounded-lg px-4 py-3 font-semibold border border-red-500 text-red-500"
          >
            New Game (clear everything)
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {sortedPlayers.map((player) => (
            <div key={player.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 min-w-[9rem]">
              <p className="text-sm font-semibold truncate">{player.name}</p>
              <p className="mt-1 text-xs tracking-[0.28em] text-white/75">
                {LETTERS.map((letter, index) => (index < player.letterCount ? letter : '_')).join(' ')}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={newPlayerName}
            onChange={(event) => setNewPlayerName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addPlayer(newPlayerName);
              }
            }}
            placeholder="Add player"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => addPlayer(newPlayerName)}
            className="rounded-lg border border-indigo-400/50 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200"
          >
            Add
          </button>
        </div>

        {players.length > 0 && (
          <div className="space-y-2">
            {players.map((player, index) => (
              <input
                key={player.id}
                type="text"
                value={player.name}
                onChange={(event) => editPlayer(player.id, event.target.value)}
                onBlur={() => commitPlayerName(player.id, index)}
                className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
