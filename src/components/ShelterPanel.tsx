import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { areaDoneCount, gameStore, isAreaComplete, isAreaUnlocked, overallProgress } from '../managers/GameStore';
import { PET_ORDER, PET_SPECIES, SHELTER_AREAS } from '../data/shelter';
import type { PlayerData, RestoreTask, ShelterArea } from '../types/game';
import { CoinIcon, HeartIcon, cx } from './ui';
import { asset } from '../lib/assets';

function TaskRow({ task, data }: { task: RestoreTask; data: PlayerData }) {
  const done = data.completedTasks.includes(task.id);
  const heartOk = data.hearts >= task.hearts;
  const coinOk = data.coins >= task.coins;
  const afford = heartOk && coinOk;

  return (
    <div className={cx('flex items-center gap-2 rounded-2xl p-2', done ? 'bg-emerald-50' : 'bg-slate-50')}>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm">{task.emoji}</div>
      <div className="min-w-0 flex-1">
        <div
          className={cx(
            'truncate text-sm',
            done ? 'text-emerald-700 line-through decoration-emerald-300' : 'text-slate-800',
          )}
        >
          {task.name}
        </div>
        {!done && (
          <div className="mt-0.5 flex items-center gap-2 text-xs tabular-nums">
            <span className={cx('flex items-center gap-0.5', heartOk ? 'text-rose-500' : 'text-slate-400')}>
              <HeartIcon className="h-3.5 w-3.5" />
              {task.hearts}
            </span>
            {task.coins > 0 && (
              <span className={cx('flex items-center gap-0.5', coinOk ? 'text-amber-600' : 'text-slate-400')}>
                <CoinIcon className="h-3.5 w-3.5" />
                {task.coins}
              </span>
            )}
          </div>
        )}
      </div>
      {done ? (
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">✓ Done</span>
      ) : (
        <button
          onClick={() => gameStore.completeTask(task.id)}
          className={cx(
            'shrink-0 rounded-full px-3.5 py-1.5 text-sm transition active:scale-95',
            afford
              ? 'anim-pulse-soft bg-linear-to-b from-amber-400 to-orange-500 text-white shadow'
              : 'bg-slate-200 text-slate-400',
          )}
        >
          Restore
        </button>
      )}
    </div>
  );
}

function AreaCard({ area, index, data, active }: { area: ShelterArea; index: number; data: PlayerData; active: boolean }) {
  const done = areaDoneCount(data, index);
  const total = area.tasks.length;
  const p = done / total;
  const complete = isAreaComplete(data, index);
  const unlocked = isAreaUnlocked(data, index);
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  const filter = unlocked
    ? `grayscale(${((1 - p) * 0.85).toFixed(2)}) sepia(${((1 - p) * 0.4).toFixed(2)}) brightness(${(0.74 + 0.26 * p).toFixed(2)}) saturate(${(0.75 + 0.35 * p).toFixed(2)})`
    : 'grayscale(1) brightness(0.6) blur(1px)';

  return (
    <div
      className={cx(
        'overflow-hidden rounded-3xl bg-white shadow-md',
        active ? 'ring-2 ring-amber-300' : 'ring-1 ring-black/5',
      )}
    >
      <button onClick={() => setOpen((o) => !o)} className="relative block aspect-[16/8] w-full overflow-hidden text-left">
        <img
          src={asset(area.image)}
          alt={area.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-1000"
          style={{ filter }}
        />
        {!complete && unlocked && (
          <>
            <span className="pointer-events-none absolute left-2 top-1 text-2xl" style={{ opacity: (1 - p) * 0.85 }}>
              🕸️
            </span>
            <span className="pointer-events-none absolute right-4 top-9 text-xl" style={{ opacity: (1 - p) * 0.7 }}>
              🍂
            </span>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-black/65 via-black/25 to-transparent p-3 pt-10">
          <div className="min-w-0">
            <div className="truncate text-lg text-white drop-shadow">
              {area.emoji} {area.name}
            </div>
            <div className="text-xs text-white/85">
              {complete ? '✨ Restored' : unlocked ? `${done}/${total} restored` : '🔒 Locked'}
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-xs tabular-nums text-slate-700">
            {Math.round(p * 100)}%
          </span>
        </div>
        {!unlocked && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs text-slate-600 shadow">
              🔒 Restore the previous area to unlock
            </span>
          </div>
        )}
        {complete && (
          <span className="anim-shine absolute right-2 top-2 rounded-full bg-amber-400 px-2.5 py-1 text-xs text-white shadow">
            Restored ✨
          </span>
        )}
      </button>
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full bg-linear-to-r from-amber-300 to-orange-400 transition-all duration-700"
          style={{ width: `${p * 100}%` }}
        />
      </div>
      {open && unlocked && (
        <div className="space-y-2 p-3">
          <p className="text-xs leading-relaxed text-slate-500">{area.description}</p>
          {area.tasks.map((t) => (
            <TaskRow key={t.id} task={t} data={data} />
          ))}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
            <div className="mb-0.5 text-amber-600">🎁 Area rewards</div>
            {area.rewardText.join(' · ')}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShelterPanel({ onClose }: { onClose?: () => void }) {
  const snap = useGame();
  const d = snap.data;
  const overall = overallProgress(d);
  const activeIndex = SHELTER_AREAS.findIndex((_, i) => !isAreaComplete(d, i));

  return (
    <div className="flex h-full w-full flex-col bg-[#FFF8EE]">
      <div className="shrink-0 border-b border-amber-100 bg-linear-to-b from-white to-[#FFF8EE] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-sky-700/80">Home Restore</div>
            <h2 className="text-xl text-slate-800">🏡 Restore Shelter</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-700">Shelter Lv.{d.shelterLevel}</span>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow ring-1 ring-black/5 transition active:scale-90"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Overall progress</span>
            <span className="tabular-nums text-slate-700">{Math.round(overall * 100)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-300 via-orange-400 to-rose-400 transition-all duration-700"
              style={{ width: `${overall * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {PET_ORDER.map((id) => {
              const sp = PET_SPECIES[id];
              if (!sp) return null;
              const unlocked = d.unlockedPets.includes(id);
              return (
                <div key={id} className="flex flex-col items-center gap-0.5" title={unlocked ? sp.label : `${sp.label} (locked)`}>
                  <div
                    className={cx(
                      'relative h-10 w-10 overflow-hidden rounded-2xl shadow ring-2 ring-white',
                      !unlocked && 'grayscale',
                    )}
                    style={{ backgroundColor: sp.color }}
                  >
                    <img src={asset(sp.image)} alt={sp.label} draggable={false} decoding="async" loading="lazy" className="h-full w-full scale-110 object-cover" />
                    {!unlocked && (
                      <span className="absolute inset-0 grid place-items-center bg-slate-900/40 text-sm">🔒</span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500">{sp.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col items-end gap-1 text-xs tabular-nums">
            <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 shadow-sm ring-1 ring-black/5">
              <HeartIcon className="h-4 w-4" />
              {d.hearts}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 shadow-sm ring-1 ring-black/5">
              <CoinIcon className="h-4 w-4" />
              {d.coins.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      <div className="soft-scroll flex-1 space-y-3 overflow-y-auto p-3 pb-28 lg:pb-4">
        {activeIndex === -1 && (
          <div className="rounded-3xl bg-linear-to-r from-amber-100 to-rose-100 p-4 text-center text-sm text-slate-700 shadow-sm">
            🏆 The shelter is fully restored! Keep caring for your friends.
          </div>
        )}
        {SHELTER_AREAS.map((area, i) => (
          <AreaCard key={area.id} area={area} index={i} data={d} active={i === activeIndex} />
        ))}
      </div>
    </div>
  );
}
