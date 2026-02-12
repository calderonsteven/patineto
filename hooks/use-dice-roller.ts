'use client';

import { useMemo, useState } from 'react';

import { defaultRollDynamics, NO_OBSTACLE_LABEL, trickPools } from '@/features/dice/config';
import { DiceResult, Difficulty, RollDynamics, Trick } from '@/features/dice/types';
import { adaptDynamicsForViewport, buildFinalResult, buildRollDynamics, randomFrom } from '@/features/dice/utils';

type PreviewResult = Omit<DiceResult, 'adaptedDifficulty'>;

function getAvailableTricks(tricks: Trick[], includeObstacle: boolean) {
  const filtered = includeObstacle ? tricks : tricks.filter((trick) => !trick.requiresObstacle);
  return filtered.length > 0 ? filtered : tricks;
}

export function useDiceRoller() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('principiante');
  const [isRolling, setIsRolling] = useState(false);
  const [rollId, setRollId] = useState(0);
  const [includeObstacle, setIncludeObstacle] = useState(false);
  const [selectedObstacles, setSelectedObstacles] = useState<string[]>([]);
  const [dynamics, setDynamics] = useState<RollDynamics>(defaultRollDynamics);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const activePool = useMemo(() => trickPools[selectedDifficulty], [selectedDifficulty]);
  const obstaclePool = useMemo(
    () => (selectedObstacles.length > 0 ? activePool.obstacle.filter((obstacle) => selectedObstacles.includes(obstacle)) : activePool.obstacle),
    [activePool, selectedObstacles]
  );

  const updateDifficulty = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setSelectedObstacles((previous) => previous.filter((obstacle) => trickPools[difficulty].obstacle.includes(obstacle)));
  };

  const updateIncludeObstacle = (enabled: boolean) => {
    setIncludeObstacle(enabled);
    if (!enabled) {
      setSelectedObstacles([]);
    }
  };

  const toggleObstacle = (obstacle: string) => {
    setSelectedObstacles((previous) =>
      previous.includes(obstacle) ? previous.filter((current) => current !== obstacle) : [...previous, obstacle]
    );
  };

  const rollDice = () => {
    if (isRolling) {
      return;
    }

    const nextDynamics = adaptDynamicsForViewport(buildRollDynamics());
    const finalResult = buildFinalResult(selectedDifficulty, includeObstacle, selectedObstacles);

    setDynamics(nextDynamics);
    setRollId((prev) => prev + 1);
    setIsRolling(true);
    setResult(null);

    const tickInterval = window.setInterval(() => {
      setPreview({
        stance: randomFrom(activePool.stance),
        obstacle: includeObstacle ? randomFrom(obstaclePool.length > 0 ? obstaclePool : activePool.obstacle) : NO_OBSTACLE_LABEL,
        trick: randomFrom(getAvailableTricks(activePool.tricks, includeObstacle)),
      });
    }, includeObstacle ? 110 : 95);

    window.setTimeout(() => {
      window.clearInterval(tickInterval);
      setResult(finalResult);
      setPreview(null);
      setIsRolling(false);
    }, nextDynamics.durationMs);
  };

  const resetResult = () => {
    if (isRolling) {
      return;
    }

    setResult(null);
    setPreview(null);
  };

  return {
    selectedDifficulty,
    setSelectedDifficulty: updateDifficulty,
    isRolling,
    rollId,
    includeObstacle,
    setIncludeObstacle: updateIncludeObstacle,
    selectedObstacles,
    toggleObstacle,
    dynamics,
    result,
    preview,
    activePool,
    rollDice,
    resetResult,
  };
}
