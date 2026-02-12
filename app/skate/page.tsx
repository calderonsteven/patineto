'use client';

import { useEffect, useMemo, useState } from 'react';

type Player = {
  id: string;
  name: string;
  letterCount: number;
  eliminated: boolean;
};

type RoundStatus = 'fallo' | 'logro' | null;

type Round = {
  id: string;
  number: number;
  trick: string;
  setterId: string;
  statuses: Record<string, RoundStatus>;
};

type Phase = 'setup' | 'order' | 'starting' | 'play';

type StoredState = {
  phase: Phase;
  players: Player[];
  turnOrder: string[];
  rounds: Round[];
  currentRound: Round | null;
};

const LETTERS = ['S', 'K', 'A', 'T', 'E'] as const;
const STORAGE_KEY = 'patineto-skate-rapid-v2';

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
  const [newPlayerName, setNewPlayerName] = useState('');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [startingPlayerName, setStartingPlayerName] = useState('');
  const [rpsLabel, setRpsLabel] = useState('Piedra...');

  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [roundSetterId, setRoundSetterId] = useState('');
  const [roundTrickName, setRoundTrickName] = useState('');
  const [showAllSkaters, setShowAllSkaters] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const safePlayers = Array.isArray(parsed.players)
        ? parsed.players.map((player, index) => ({
            id: player.id || createId(),
            name: player.name?.trim() || `Player ${index + 1}`,
            letterCount: clampLetterCount(Number(player.letterCount) || 0),
            eliminated: Boolean(player.eliminated) || clampLetterCount(Number(player.letterCount) || 0) >= 5,
          }))
        : [];

      setPlayers(safePlayers);
      setTurnOrder(Array.isArray(parsed.turnOrder) ? parsed.turnOrder.filter(Boolean) : []);
      setRounds(Array.isArray(parsed.rounds) ? parsed.rounds : []);
      setCurrentRound(parsed.currentRound ?? null);

      if (parsed.phase && ['setup', 'order', 'starting', 'play'].includes(parsed.phase)) {
        setPhase(parsed.phase);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const state: StoredState = {
      phase,
      players,
      turnOrder,
      rounds,
      currentRound,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [phase, players, turnOrder, rounds, currentRound]);

  const playersById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);
  const remainingPlayers = useMemo(() => players.filter((player) => !player.eliminated), [players]);
  const winner = phase === 'play' && remainingPlayers.length === 1 ? remainingPlayers[0] : null;

  useEffect(() => {
    if (phase !== 'starting') return;
    if (!turnOrder.length) return;

    const sequence = ['Piedra...', 'Papel...', 'Tijera...'];
    sequence.forEach((label, index) => {
      setTimeout(() => setRpsLabel(label), index * 450);
    });

    const finalTimeout = setTimeout(() => {
      const randomId = turnOrder[Math.floor(Math.random() * turnOrder.length)];
      const starterName = playersById.get(randomId)?.name || 'Jugador';
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

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers((prev) => [...prev, createPlayer(name)]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
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
    setRounds([]);
    setCurrentRound(null);
    setShowAllSkaters(false);
    setPhase('order');

    setTimeout(() => {
      setPhase('starting');
    }, 900);
  };

  const currentParticipants = useMemo(() => {
    if (!currentRound) return [];
    return remainingPlayers.filter((player) => player.id !== currentRound.setterId);
  }, [currentRound, remainingPlayers]);

  const isCurrentRoundComplete = useMemo(() => {
    if (!currentRound) return true;
    return currentParticipants.every((player) => currentRound.statuses[player.id] === 'fallo' || currentRound.statuses[player.id] === 'logro');
  }, [currentRound, currentParticipants]);

  const openRoundModal = () => {
    if (winner) return;

    const activeIds = remainingPlayers.map((player) => player.id);
    const defaultSetter = activeIds[0] ?? '';
    setRoundSetterId(defaultSetter);
    setRoundTrickName('');
    setIsRoundModalOpen(true);
  };

  const startNextRound = () => {
    if (!roundSetterId || !roundTrickName.trim()) return;

    const statuses: Record<string, RoundStatus> = {};
    remainingPlayers.forEach((player) => {
      if (player.id !== roundSetterId) statuses[player.id] = null;
    });

    const nextRound: Round = {
      id: createId(),
      number: rounds.length + 1,
      setterId: roundSetterId,
      trick: roundTrickName.trim(),
      statuses,
    };

    setCurrentRound(nextRound);
    setIsRoundModalOpen(false);
  };

  const setSkaterStatus = (playerId: string, status: Exclude<RoundStatus, null>) => {
    if (!currentRound) return;

    setCurrentRound({
      ...currentRound,
      statuses: {
        ...currentRound.statuses,
        [playerId]: status,
      },
    });
  };

  const finalizeCurrentRound = () => {
    if (!currentRound || !isCurrentRoundComplete) return;

    const updatedPlayersSnapshot = players.map((player) => {
      const playerStatus = currentRound.statuses[player.id];
      if (playerStatus !== 'fallo') return player;

      const nextCount = clampLetterCount(player.letterCount + 1);
      return {
        ...player,
        letterCount: nextCount,
        eliminated: nextCount >= 5,
      };
    });

    setPlayers(updatedPlayersSnapshot);
    setRounds((prev) => [...prev, currentRound]);
    setCurrentRound(null);

    const aliveAfterRound = updatedPlayersSnapshot.filter((player) => !player.eliminated);
    if (aliveAfterRound.length <= 1) return;

    setRoundSetterId(aliveAfterRound[0]?.id ?? '');
    setRoundTrickName('');
    setIsRoundModalOpen(true);
  };

  const restartWithSamePlayers = () => {
    setPhase('setup');
    setPlayers((prev) => prev.map((player) => ({ ...player, letterCount: 0, eliminated: false })));
    setTurnOrder([]);
    setRounds([]);
    setCurrentRound(null);
    setShowAllSkaters(false);
    setIsRoundModalOpen(false);
    setRoundSetterId('');
    setRoundTrickName('');
    setStartingPlayerName('');
    setRpsLabel('Piedra...');
  };

  const playerStats = useMemo(() => {
    return players.map((player) => {
      const tricksSet = rounds.filter((round) => round.setterId === player.id).map((round) => round.trick);
      const falloCount = rounds.reduce((acc, round) => (round.statuses[player.id] === 'fallo' ? acc + 1 : acc), 0);
      const logroCount = rounds.reduce((acc, round) => (round.statuses[player.id] === 'logro' ? acc + 1 : acc), 0);

      return {
        ...player,
        tricksSet,
        falloCount,
        logroCount,
      };
    });
  }, [players, rounds]);

  const winnerStats = winner ? playerStats.find((player) => player.id === winner.id) : null;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8">
      {phase === 'setup' && (
        <div className="space-y-5">
          <h1 className="text-center text-3xl font-black">Juego de S.K.A.T.E</h1>
          <p className="text-center text-sm text-deck-300">Agrega al menos 2 skaters para comenzar.</p>

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
              placeholder="Nombre del skater"
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
              <div key={player.id} className="flex gap-2">
                <input
                  type="text"
                  value={player.name}
                  onChange={(event) => updatePlayer(player.id, event.target.value)}
                  onBlur={() => commitPlayerName(player.id, index)}
                  className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removePlayer(player.id)}
                  className="rounded-lg border border-red-500/50 px-3 text-sm font-semibold text-red-300"
                >
                  Quitar
                </button>
              </div>
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
          {!winner ? (
            <button
              type="button"
              onClick={currentRound ? finalizeCurrentRound : openRoundModal}
              disabled={Boolean(currentRound && !isCurrentRoundComplete)}
              className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-lg font-bold text-white disabled:opacity-40"
            >
              {rounds.length === 0 && !currentRound ? 'Iniciar ronda' : 'Siguiente ronda'}
            </button>
          ) : null}

          {currentRound && (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Truco actual</p>
                <p className="mt-1 text-3xl font-bold uppercase">{currentRound.trick}</p>
                <p className="text-sm text-white/70">Lo puso: {playersById.get(currentRound.setterId)?.name ?? '—'}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {currentParticipants.map((player) => {
                  const selected = currentRound.statuses[player.id];
                  return (
                    <div key={player.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-sm text-white/70">{lettersForCount(player.letterCount)}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSkaterStatus(player.id, 'fallo')}
                          className={`rounded-lg px-3 py-2 text-sm font-bold ${selected === 'fallo' ? 'bg-red-600 text-white' : 'bg-red-500/20 text-red-200'}`}
                        >
                          ❌ Falló
                        </button>
                        <button
                          type="button"
                          onClick={() => setSkaterStatus(player.id, 'logro')}
                          className={`rounded-lg px-3 py-2 text-sm font-bold ${selected === 'logro' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/20 text-emerald-200'}`}
                        >
                          🛹 Logró
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAllSkaters((prev) => !prev)}
            className="w-fit rounded-md border border-white/20 px-3 py-1 text-xs font-semibold"
          >
            Ver todos los skater
          </button>

          {showAllSkaters && (
            <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm">
              <ul className="space-y-3">
                {playerStats.map((player) => (
                  <li key={player.id} className="rounded-lg border border-white/10 p-3">
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-white/75">Trucos que puso: {player.tricksSet.length ? player.tricksSet.join(', ') : '—'}</p>
                    <p className="text-white/75">Falló: {player.falloCount} · Logró: {player.logroCount}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {winner && (
            <div className="space-y-3 rounded-2xl border border-emerald-400/40 bg-emerald-950/20 p-5 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Felicitaciones</p>
              <h2 className="text-4xl font-black">🏆 {winner.name}</h2>
              <p className="text-white/80">Ganó el juego de S.K.A.T.E.</p>
              <p className="text-white/80">
                Trucos que puso: {winnerStats?.tricksSet.length ? winnerStats.tricksSet.join(', ') : '—'}
              </p>
              <p className="text-white/80">
                Falló: {winnerStats?.falloCount ?? 0} · Logró: {winnerStats?.logroCount ?? 0}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={restartWithSamePlayers}
            className="w-full rounded-lg border border-indigo-500 px-4 py-3 font-semibold text-indigo-200"
          >
            Iniciar nuevo juego
          </button>
        </div>
      )}

      {isRoundModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/15 bg-[#0d1020] p-5">
            <h3 className="text-xl font-black">Nueva ronda</h3>
            <p className="text-sm text-white/70">Selecciona quién pone el truco y escribe el nombre del truco.</p>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.14em] text-white/60">Skater que pone el truco</label>
              <select
                value={roundSetterId}
                onChange={(event) => setRoundSetterId(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2"
              >
                {remainingPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.14em] text-white/60">Nombre del truco</label>
              <input
                type="text"
                value={roundTrickName}
                onChange={(event) => setRoundTrickName(event.target.value)}
                placeholder="Ej: Kickflip"
                className="w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRoundModalOpen(false)}
                className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={startNextRound}
                disabled={!roundSetterId || !roundTrickName.trim()}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                OK 🛹
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
