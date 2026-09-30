import { memo, useEffect, useRef, useState } from 'react';
import type * as Phaser from 'phaser';
import { createGame } from '../game/main';

/** Phaser 3 머지 보드를 React 트리에 마운트 (WebGL 실패 시 폴백 UI) */
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
        보드를 불러오지 못했어요. 브라우저를 최신 버전으로 업데이트한 뒤 다시 시도해 주세요 🐾
      </div>
    );
  }
  return <div ref={ref} className="board-wrap absolute inset-0" />;
}

const PhaserBoard = memo(PhaserBoardInner);
export default PhaserBoard;
