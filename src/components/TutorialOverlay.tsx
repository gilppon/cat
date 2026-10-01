import { useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { gameStore, tutorialStep } from '../managers/GameStore';
import { cx } from './ui';

const STEPS = [
  { emoji: '🧩', title: '합치기', desc: '같은 🥛따뜻한 우유 2개를 드래그해서 합쳐보세요!' },
  { emoji: '🎁', title: '전달하기', desc: '나비의 주문이 준비됐어요! [전달하기] 버튼을 눌러주세요.' },
  { emoji: '🏡', title: '쉼터 복원', desc: '쉼터 복원 화면에서 🌿무성한 잡초 뽑기를 완료해보세요! (모바일은 하단 탭, 데스크톱은 오른쪽 패널)' },
  { emoji: '🎉', title: '수료!', desc: '이제 진짜 쉼터 주인이에요! 선물을 받아가세요.' },
];

/** 첫 60초 인터랙티브 튜토리얼. 보드 조작을 막지 않음(카드以外 pointer-events-none). */
export default function TutorialOverlay() {
  const snap = useGame();
  const step = tutorialStep(snap.data);
  const hinted = useRef<number>(-1);

  useEffect(() => {
    if (snap.data.tutorialSeen || hinted.current === step) return;
    hinted.current = step;
    if (step === 0) gameStore.hint('food', 1);
    else if (step === 1) gameStore.hint('food', 2);
  }, [step, snap.data.tutorialSeen]);

  if (snap.data.tutorialSeen) return null;
  const s = STEPS[step] ?? { emoji: '🐾', title: '환영!', desc: '쉼터를 복원해봐요!' };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[86px] z-40 flex justify-center px-4 lg:bottom-6">
      <div className="anim-sheet-in w-full max-w-md rounded-[22px] bg-slate-900/92 p-3.5 text-white shadow-2xl ring-2 ring-amber-300/70 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl">{s.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-300">
                {step + 1}/4 · {s.title}
              </span>
              <span className="flex gap-1">
                {STEPS.map((_, i) => (
                  <span key={i} className={cx('h-1.5 w-4 rounded-full', i <= step ? 'bg-amber-300' : 'bg-white/25')} />
                ))}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] leading-snug text-white/90">{s.desc}</p>
          </div>
        </div>
        <div className="pointer-events-auto mt-2 flex gap-2">
          {step < 3 ? (
            <button
              onClick={() => gameStore.skipTutorial()}
              className="flex-1 rounded-xl bg-white/10 py-1.5 text-xs text-white/70 active:scale-95"
            >
              건너뛰기
            </button>
          ) : (
            <button
              onClick={() => gameStore.finishTutorial()}
              className="flex-1 rounded-xl bg-amber-400 py-2 text-sm font-bold text-amber-950 active:scale-95"
            >
              🎁 선물 받기 (+30코인)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
