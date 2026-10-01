import { useEffect, useState, useSyncExternalStore } from 'react';
import { gameStore } from '../managers/GameStore';
import type { GameSnapshot } from '../managers/GameStore';

/** Subscribes to the GameStore snapshot */
export function useGame(): GameSnapshot {
  return useSyncExternalStore(gameStore.subscribe, gameStore.getSnapshot, gameStore.getSnapshot);
}

/** Current time, refreshed every interval (for timer displays) */
export function useNow(interval = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [interval]);
  return now;
}
