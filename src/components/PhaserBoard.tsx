import { memo, useEffect, useRef, useState } from 'react';
import type * as Phaser from 'phaser';
import { createGame } from '../game/main';

/** Mounts the Phaser 3 merge board into the React tree (fallback UI if WebGL fails) */
function PhaserBoardInner() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let game: Phaser.Game | null = null;
    try {
      game = createGame(el);
    } catch {
      setFailed(true);
    }
    return () => {
      try {
        game?.destroy(true);
      } catch {
        /* ignore */
      }
    };
  }, []);

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center rounded-3xl bg-white/80 p-6 text-center text-sm text-slate-600">
        Could not load the board. Please update to a newer browser and try again 🐾
      </div>
    );
  }
  return <div ref={ref} className="board-wrap absolute inset-0" />;
}

const PhaserBoard = memo(PhaserBoardInner);
export default PhaserBoard;
