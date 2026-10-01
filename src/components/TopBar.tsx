import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useGame, useNow } from '../hooks/useGame';
import { ENERGY_REGEN_MS } from '../managers/GameStore';
import { BoltIcon, CoinIcon, HeartIcon, cx } from './ui';

interface PillProps {
  label: string;
  icon: ReactNode;
  value: string;
  sub?: string;
  onPlus?: () => void;
}

function Pill({ label, icon, value, sub, onPlus }: PillProps) {
  const [bump, setBump] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setBump((b) => b + 1);
    }
  }, [value]);

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-white/90 py-1 pl-1 pr-2 shadow-sm ring-1 ring-black/5"
      title={label}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-50">{icon}</span>
      <div className="flex flex-col leading-none">
        <span key={bump} className={cx('text-[15px] tabular-nums text-slate-800', bump > 0 && 'anim-bump')}>
          {value}
        </span>
        {sub && <span className="mt-0.5 text-[10px] tabular-nums text-slate-400">{sub}</span>}
      </div>
      {onPlus && (
        <button
          onClick={onPlus}
          aria-label="Refill energy"
          className="ml-0.5 grid h-6 w-6 place-items-center rounded-full bg-linear-to-b from-emerald-400 to-emerald-500 text-sm text-white shadow transition active:scale-90"
        >
          +
        </button>
      )}
    </div>
  );
}

interface TopBarProps {
  onShop: () => void;
  onMenu: () => void;
  onShelter: () => void;
  shelterBadge: boolean;
}

export default function TopBar({ onShop, onMenu, onShelter, shelterBadge }: TopBarProps) {
  const snap = useGame();
  const now = useNow(1000);
  const d = snap.data;
  const full = d.energy >= d.maxEnergy;
  const remain = Math.max(0, ENERGY_REGEN_MS - (now - d.lastEnergyRegenTime));
  const secs = Math.ceil(remain / 1000);
  const timer = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <header className="relative z-30 flex items-center gap-2 px-2 py-2 sm:px-4">
      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-amber-300 to-orange-400 text-xl shadow-md ring-2 ring-white min-[390px]:grid">
          🐾
        </div>
        <div className="hidden leading-tight md:block">
          <div className="text-[11px] text-sky-800/70">Pet Shelter Merge</div>
          <div className="text-lg text-slate-800">Pets Harbor</div>
        </div>
        <span className="hidden rounded-full bg-white/85 px-2.5 py-1 text-xs text-amber-700 ring-1 ring-amber-200 sm:inline-flex">
          🏠 Shelter Lv.{d.shelterLevel}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
        <Pill label="Coins" icon={<CoinIcon />} value={d.coins.toLocaleString('en-US')} />
        <Pill label="Hearts" icon={<HeartIcon />} value={d.hearts.toLocaleString('en-US')} />
        <Pill
          label="Energy"
          icon={<BoltIcon />}
          value={`${d.energy}/${d.maxEnergy}`}
          sub={full ? 'MAX' : `+1 ${timer}`}
          onPlus={onShop}
        />
      </div>

      <button
        onClick={onShelter}
        className="relative hidden items-center gap-1 rounded-full bg-linear-to-b from-amber-400 to-orange-500 px-3.5 py-2 text-sm text-white shadow-md transition active:scale-95 lg:inline-flex xl:hidden"
      >
        🏡 Restore Shelter
        {shelterBadge && (
          <span className="anim-badge absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>
      <button
        onClick={onMenu}
        aria-label="Settings"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/90 text-lg shadow-sm ring-1 ring-black/5 transition active:scale-90"
      >
        ⚙️
      </button>
    </header>
  );
}
