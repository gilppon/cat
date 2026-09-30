import { useEffect, useState, useSyncExternalStore } from 'react';
import { gameStore } from '../managers/GameStore';
import type { GameSnapshot } from '../managers/GameStore';

/** GameStore 스냅샷 구독 */
export function useGame(): GameSnapshot {
  return useSyncExternalStore(gameStore.subscribe, gameStore.getSnapshot, gameStore.getSnapshot);
}

/** 1초마다 갱신되는 현재 시각 (타이머 표시용) */
export function useNow(interval = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [interval]);
  return now;
}
