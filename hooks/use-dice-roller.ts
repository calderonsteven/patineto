'use client';

import { useMemo, useState } from 'react';

import { defaultRollDynamics, NO_OBSTACLE_LABEL, trickPools } from '@/features/dice/config';
import { DiceResult, Difficulty, RollDynamics } from '@/features/dice/types';
import { adaptDynamicsForViewport, buildFinalResult, buildRollDynamics, randomFrom } from '@/features/dice/utils';

type PreviewResult = Omit<DiceResult, 'adaptedDifficulty'>;

export function useDiceRoller() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('principiante');
  const [isRolling, setIsRolling] = useState(false);
  const [rollId, setRollId] = useState(0);
  const [includeObstacle, setIncludeObstacle] = useState(false);
  const [dynamics, setDynamics] = useState<RollDynamics>(defaultRollDynamics);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const activePool = useMemo(() => trickPools[selectedDifficulty], [selectedDifficulty]);

  const rollDice = () => {
    if (isRolling) {
      return;
    }

    const nextDynamics = adaptDynamicsForViewport(buildRollDynamics());
    const finalResult = buildFinalResult(selectedDifficulty, includeObstacle);

    setDynamics(nextDynamics);
    setRollId((prev) => prev + 1);
    setIsRolling(true);
    setResult(null);

    const tickInterval = window.setInterval(() => {
      setPreview({
        stance: randomFrom(activePool.stance),
        obstacle: includeObstacle ? randomFrom(activePool.obstacle) : NO_OBSTACLE_LABEL,
        trick: randomFrom(activePool.tricks),
      });
    }, includeObstacle ? 110 : 95);

    window.setTimeout(() => {
      window.clearInterval(tickInterval);
      setResult(finalResult);
      setPreview(null);
      setIsRolling(false);
    }, nextDynamics.durationMs);
  };

  return {
    selectedDifficulty,
    setSelectedDifficulty,
    isRolling,
    rollId,
    includeObstacle,
    setIncludeObstacle,
    dynamics,
    result,
    preview,
    activePool,
    rollDice,
  };
}
