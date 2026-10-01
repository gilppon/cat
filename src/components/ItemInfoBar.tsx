import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { gameStore } from '../managers/GameStore';
import { CATEGORY_META, MergeManager } from '../managers/MergeManager';
import { CoinIcon, cx } from './ui';

const TIPS = [
  'Drag two identical items together to upgrade one step!',
  'Tap a generator below to spawn an item for ⚡1 energy.',
  'Tap an item icon on a request card to find it on the board.',
  'Items with a ✅ badge can be delivered to a friend right away.',
  'Gather hearts and coins to restore the shelter and welcome new friends.',
  'Energy refills by 1 automatically every 15 seconds.',
  'Tap an item to see its details and sell it.',
];

export default function ItemInfoBar() {
  const snap = useGame();
  const d = snap.data;
  const sel = snap.selected;
  const item = sel ? d.boardState[sel.row]?.[sel.col] ?? null : null;
  const [confirm, setConfirm] = useState(false);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    setConfirm(false);
  }, [sel?.row, sel?.col, item?.id]);

  useEffect(() => {
    const id = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 6000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!confirm) return;
    const id = window.setTimeout(() => setConfirm(false), 2600);
    return () => window.clearTimeout(id);
  }, [confirm]);

  if (!item || !sel) {
    return (
      <div className="flex h-[54px] w-full max-w-[640px] shrink-0 items-center gap-2 rounded-2xl bg-white/70 px-3 text-[13px] text-slate-600 shadow-sm ring-1 ring-black/5">
        <span className="text-lg">💡</span>
        <span key={tip} className="anim-fade-in line-clamp-2">
          {TIPS[tip]}
        </span>
      </div>
    );
  }

  const meta = CATEGORY_META[item.category];
  const next = MergeManager.getItem(item.category, item.level + 1);
  const chain = MergeManager.getChain(item.category);
  const needed = d.orders.some((o) => o.requiredCategory === item.category && o.requiredLevel === item.level);
  const price = MergeManager.sellPrice(item);

  const sell = () => {
    if (needed && !confirm) {
      setConfirm(true);
      return;
    }
    gameStore.sellItem(sel);
  };

  return (
    <div className="anim-fade-in flex h-[54px] w-full max-w-[640px] shrink-0 items-center gap-2 rounded-2xl bg-white/90 px-2 shadow-sm ring-1 ring-black/5">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-2xl shadow-sm ring-2 ring-white"
        style={{ background: `linear-gradient(180deg, ${meta.light}, ${meta.mid})` }}
      >
        {item.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm text-slate-800">{item.name}</span>
          <span className="shrink-0 rounded-full px-1.5 py-px text-[10px] text-white" style={{ backgroundColor: meta.dark }}>
            Lv.{item.level}
          </span>
          {needed && <span className="shrink-0 text-[10px] text-emerald-600">✅ Requested</span>}
        </div>
        <div className="truncate text-[11px] text-slate-500">
          {next ? (
            <>
              Merge one more → {next.emoji} {next.name}
            </>
          ) : (
            '✨ Max level item!'
          )}
        </div>
      </div>
      <div className="hidden items-center gap-0.5 md:flex">
        {chain.map((c) => {
          const known = d.discoveredItems.includes(c.id);
          return (
            <span
              key={c.id}
              title={known ? `Lv.${c.level} ${c.name}` : '???'}
              className={cx(
                'grid h-6 w-6 place-items-center rounded-full text-[13px]',
                c.id === item.id ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-slate-100',
                !known && 'text-[10px] text-slate-400',
              )}
            >
              {known ? c.emoji : '?'}
            </span>
          );
        })}
      </div>
      <button
        onClick={sell}
        className={cx(
          'flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs shadow-sm transition active:scale-95',
          confirm ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
        )}
      >
        {confirm ? (
          'Sell?'
        ) : (
          <>
            Sell <CoinIcon className="h-4 w-4" /> {price}
          </>
        )}
      </button>
    </div>
  );
}
