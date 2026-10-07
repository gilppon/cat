import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { SaveManager } from '../managers/SaveManager';
import { gameStore } from '../managers/GameStore';
import { PET_ORDER, PET_SPECIES } from '../data/shelter';
import { asset } from '../lib/assets';
import { getRestoreInvite } from '../lib/share';
import { SHELTER_AREAS } from '../data/shelter';

const FEATURES = [
  { icon: '🧩', text: 'Merge matching\nitems' },
  { icon: '🐾', text: 'Help your\nfriends' },
  { icon: '🏡', text: 'Restore an old\nshelter' },
];

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  const [hasSave, setHasSave] = useState(() => SaveManager.hasSave());
  const [confirmReset, setConfirmReset] = useState(false);
  const inviteArea = SHELTER_AREAS.find((area) => area.id === getRestoreInvite());
  const paws = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 7.3 + Math.random() * 6) % 100,
        size: 18 + Math.random() * 22,
        dur: 10 + Math.random() * 9,
        delay: -Math.random() * 16,
        rot: Math.round(Math.random() * 60 - 30),
      })),
    [],
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-sky-200">
      <img src={asset('images/areas/yard.webp')} alt="" decoding="async" fetchPriority="high" className="anim-kenburns absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-b from-sky-900/25 via-transparent to-amber-950/50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {paws.map((p, i) => (
          <span
            key={i}
            className="anim-paw absolute bottom-[-10%] opacity-0"
            style={
              {
                left: `${p.left}%`,
                fontSize: p.size,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                '--r': `${p.rot}deg`,
              } as CSSProperties
            }
          >
            🐾
          </span>
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col items-center overflow-y-auto p-5">
        <div className="anim-scale-in my-auto w-full max-w-md rounded-[32px] bg-white/85 p-6 text-center shadow-2xl ring-1 ring-white/80 backdrop-blur-md sm:p-8">
          <div className="anim-float mx-auto mb-3 grid h-16 w-16 place-items-center rounded-[22px] bg-linear-to-br from-amber-300 to-orange-400 text-3xl shadow-lg ring-4 ring-white">
            🐾
          </div>
          <p className="text-sm tracking-wide text-sky-700">Pet Shelter Merge</p>
          <h1 className="mt-1 text-[40px] leading-[1.05] text-slate-800 sm:text-5xl">Pets Harbor</h1>
          <p className="text-xl text-orange-500 sm:text-2xl">&amp; Home Restore</p>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
            Rebuild an abandoned seaside shelter and give hurt little friends a warm home.
          </p>
          {inviteArea && (
            <div className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-100">
              A friend restored {inviteArea.name}. Can you help welcome the next animal? 🐾
            </div>
          )}

          <div className="mt-4 flex justify-center -space-x-2">
            {PET_ORDER.map((id, i) => {
              const sp = PET_SPECIES[id];
              if (!sp) return null;
              return (
                <div
                  key={id}
                  className="anim-float h-14 w-14 overflow-hidden rounded-full shadow-md ring-4 ring-white"
                  style={{ backgroundColor: sp.color, animationDelay: `${i * 0.35}s` }}
                >
                  <img src={asset(sp.image)} alt={sp.label} draggable={false} decoding="async" className="h-full w-full scale-110 object-cover" />
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {FEATURES.map((f) => (
              <div key={f.icon} className="rounded-2xl bg-white/80 px-1 py-2.5 shadow-sm ring-1 ring-black/5">
                <div className="text-2xl">{f.icon}</div>
                <div className="mt-1 whitespace-pre-line text-[11px] leading-tight text-slate-600">{f.text}</div>
              </div>
            ))}
          </div>

          <button
            onClick={onStart}
            className="anim-pulse-cta mt-6 w-full rounded-full bg-linear-to-b from-orange-400 to-orange-500 py-3.5 text-xl text-white shadow-lg transition active:scale-[0.98]"
          >
            {hasSave ? '▶ Continue' : '▶ Play'}
          </button>
          {hasSave && (
            <button
              onClick={() => {
                if (!confirmReset) {
                  setConfirmReset(true);
                  return;
                }
                gameStore.reset();
                setHasSave(false);
                setConfirmReset(false);
              }}
              className="mt-3 text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600"
            >
              {confirmReset ? 'Really start over? Tap again to erase all progress' : 'Start over from the beginning'}
            </button>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-white/90 drop-shadow">
          Progress saves automatically in this browser
        </p>
      </div>
    </div>
  );
}
