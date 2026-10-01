import { useGame } from '../hooks/useGame';
import { gameStore, REFRESH_ORDER_COST } from '../managers/GameStore';
import { CATEGORY_META, MergeManager } from '../managers/MergeManager';
import type { Board, CategoryMeta } from '../managers/MergeManager';
import { PET_BY_TYPE } from '../data/shelter';
import type { ItemConfig, PetOrder, PetSpecies } from '../types/game';
import { CoinIcon, HeartIcon, cx } from './ui';
import { asset } from '../lib/assets';

function Portrait({ species, sick, size }: { species: PetSpecies; sick: boolean; size: string }) {
  return (
    <div
      className={cx('relative shrink-0 overflow-hidden rounded-2xl shadow-sm ring-2 ring-white', size)}
      style={{ backgroundColor: species.color }}
    >
      <img src={asset(species.image)} alt={species.label} draggable={false} decoding="async" className="h-full w-full scale-110 object-cover" />
      {sick && <span className="absolute -bottom-0.5 -right-0.5 text-sm drop-shadow">🤒</span>}
    </div>
  );
}

function NeedTile({ item, meta, size, order }: { item: ItemConfig; meta: CategoryMeta; size: string; order: PetOrder }) {
  return (
    <button
      onClick={() => gameStore.hint(order.requiredCategory, order.requiredLevel)}
      title="Find on board"
      className={cx(
        'relative grid shrink-0 place-items-center rounded-xl text-2xl shadow-sm ring-2 ring-white transition active:scale-90',
        size,
      )}
      style={{ background: `linear-gradient(180deg, ${meta.light}, ${meta.mid})` }}
    >
      <span className="drop-shadow-sm">{item.emoji}</span>
      <span
        className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full text-[10px] text-white ring-2 ring-white"
        style={{ backgroundColor: meta.dark }}
      >
        {item.level}
      </span>
    </button>
  );
}

function Rewards({ order }: { order: PetOrder }) {
  return (
    <div className="flex items-center gap-1.5 text-xs tabular-nums text-slate-700">
      <span className="flex items-center gap-0.5">
        <CoinIcon className="h-4 w-4" />
        {order.rewardCoins.toLocaleString('en-US')}
      </span>
      <span className="flex items-center gap-0.5">
        <HeartIcon className="h-4 w-4" />
        {order.rewardHearts.toLocaleString('en-US')}
      </span>
    </div>
  );
}

function DeliverButton({ ready, order }: { ready: boolean; order: PetOrder }) {
  return (
    <button
      disabled={!ready}
      onClick={() => gameStore.deliverOrder(order.id)}
      className={cx(
        'shrink-0 rounded-full px-3 py-1.5 text-xs transition',
        ready
          ? 'anim-pulse-soft bg-linear-to-b from-emerald-400 to-emerald-500 text-white shadow active:scale-95'
          : 'bg-slate-100 text-slate-400',
      )}
    >
      {ready ? 'Deliver' : 'Not ready'}
    </button>
  );
}

function OrderCard({ order, board, column }: { order: PetOrder; board: Board; column: boolean }) {
  const item = MergeManager.getItem(order.requiredCategory, order.requiredLevel);
  if (!item) return null;
  const meta = CATEGORY_META[order.requiredCategory];
  const species = PET_BY_TYPE[order.petType];
  const ready = !!MergeManager.findItem(board, order.requiredCategory, order.requiredLevel);
  const progress = MergeManager.materialProgress(board, order.requiredCategory, order.requiredLevel);
  const best = MergeManager.highestLevel(board, order.requiredCategory);

  const refresh = (
    <button
      onClick={() => gameStore.refreshOrder(order.id)}
      title={`Call another friend (${REFRESH_ORDER_COST} coins)`}
      aria-label={`Call another friend (${REFRESH_ORDER_COST} coins)`}
      className={cx(
        'absolute grid place-items-center rounded-full bg-white text-slate-400 shadow ring-1 ring-black/5 transition hover:text-slate-700 active:scale-90',
        column ? 'right-2 top-2 h-7 w-7 text-xs' : '-left-1.5 -top-1.5 h-5 w-5 text-[10px]',
      )}
    >
      ↻
    </button>
  );

  const bar = (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: ready ? '#10B981' : meta.mid }}
      />
    </div>
  );

  if (!column) {
    return (
      <article
        className={cx(
          'anim-card-in relative w-[172px] shrink-0 snap-start rounded-[20px] bg-white/90 p-2 shadow-md ring-2',
          ready ? 'ring-emerald-400' : order.golden ? 'ring-amber-400' : 'ring-white/70',
        )}
      >
        {order.golden && (
          <span className="absolute -top-2 left-2 z-10 rounded-full bg-amber-400 px-1.5 py-px text-[10px] text-amber-950 shadow">
👑 Golden
          </span>
        )}
        {ready && (
          <span className="absolute -top-2 right-2 z-10 rounded-full bg-emerald-500 px-1.5 py-px text-[10px] text-white shadow">
            Ready
          </span>
        )}
        <div className="flex items-center gap-2">
          <Portrait species={species} sick={!order.isHealthy} size="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm leading-tight text-slate-800">{order.petName}</div>
            <div className="truncate text-[10px] text-slate-400">{meta.need}…</div>
          </div>
          <NeedTile item={item} meta={meta} size="h-11 w-11" order={order} />
        </div>
        <div className="mt-1.5">{bar}</div>
        <div className="mt-1.5 flex items-center justify-between gap-1">
          <Rewards order={order} />
          <DeliverButton ready={ready} order={order} />
        </div>
        {refresh}
      </article>
    );
  }

  return (
    <article
      className={cx(
        'anim-card-in relative w-full rounded-[22px] bg-white/90 p-3 shadow-md ring-2 transition-shadow',
        ready ? 'ring-emerald-400 shadow-emerald-200/70' : order.golden ? 'ring-amber-300' : 'ring-white/80',
      )}
    >
      {order.golden && (
        <span className="absolute -top-2 right-10 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] text-amber-950 shadow">
          👑 Golden · 1.5x reward
        </span>
      )}
      {ready && (
        <span className="absolute -top-2 left-3 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] text-white shadow">
          Ready!
        </span>
      )}
      {refresh}
      <div className="flex items-center gap-2.5 pr-8">
        <Portrait species={species} sick={!order.isHealthy} size="h-14 w-14" />
        <div className="min-w-0">
          <div className="truncate text-base leading-tight text-slate-800">{order.petName}</div>
          <div className="truncate text-[11px] text-slate-400">
            {species.label} · {meta.need}
          </div>
        </div>
      </div>
      <div className="mt-2 rounded-2xl rounded-tl-sm bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
        “{order.message}”
      </div>
      <div className="mt-2 flex items-center gap-2.5 rounded-2xl p-2" style={{ backgroundColor: meta.soft }}>
        <NeedTile item={item} meta={meta} size="h-12 w-12" order={order} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-slate-700">{item.name}</div>
          <div className="mt-1">{bar}</div>
          <div className="mt-1 text-[10px] text-slate-400">
            {ready
              ? 'On your board! Ready to deliver'
              : best > 0
                ? `Best Lv.${best} · need Lv.${item.level}`
                : 'Not on the board yet'}
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <Rewards order={order} />
        <DeliverButton ready={ready} order={order} />
      </div>
    </article>
  );
}

export default function OrdersPanel({ layout }: { layout: 'row' | 'column' }) {
  const snap = useGame();
  const d = snap.data;
  const column = layout === 'column';

  return (
    <section className={cx('w-full', column && 'flex min-h-0 flex-1 flex-col')}>
      <div className="mb-1.5 flex items-center justify-between px-1">
        <h2 className={cx('text-slate-700', column ? 'text-base' : 'text-[13px]')}>🐾 Friends Needing Help</h2>
        <span className="text-[11px] text-slate-500">{d.stats.ordersCompleted.toLocaleString('en-US')} cared for</span>
      </div>
      <div
        className={cx(
          column
            ? 'soft-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-2 pt-2'
            : 'no-scrollbar -mx-2 flex snap-x gap-2 overflow-x-auto px-3.5 pb-1.5 pt-2.5',
        )}
      >
        {d.orders.map((o) => (
          <OrderCard key={o.id} order={o} board={d.boardState} column={column} />
        ))}
      </div>
    </section>
  );
}
