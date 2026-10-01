import { useState } from 'react';
import { useGame, useNow } from '../hooks/useGame';
import { ENERGY_PACKS, ENERGY_REGEN_MS, GIFT_COOLDOWN_MS, energyFullPrice, gameStore } from '../managers/GameStore';
import { Ads } from '../lib/ads';
import type { PlayerData } from '../types/game';
import { BoltIcon, CoinIcon, Modal, cx } from './ui';

const PACK_ICON: Record<string, string> = { small: '⚡', medium: '🔋', full: '🌟' };

function ShopContent({ data }: { data: PlayerData }) {
  const now = useNow(1000);
  const [adBusy, setAdBusy] = useState(false);
  const giftLeft = Math.max(0, GIFT_COOLDOWN_MS - (now - data.lastGiftTime));
  const giftReady = giftLeft <= 0;
  const totalSecs = Math.ceil(giftLeft / 1000);
  const timer = `${Math.floor(totalSecs / 60)}:${String(totalSecs % 60).padStart(2, '0')}`;

  const watchEnergyAd = async () => {
    if (adBusy || data.energy >= data.maxEnergy) return;
    setAdBusy(true);
    try {
      const ok = await Ads.rewardedBreak();
      if (ok) gameStore.grantAdReward('energy');
    } finally {
      setAdBusy(false);
    }
  };

  const watchGiftAd = async () => {
    if (adBusy || !giftReady) return;
    setAdBusy(true);
    try {
      const ok = await Ads.rewardedBreak();
      if (ok && gameStore.claimGift()) gameStore.grantAdReward('giftBonus');
    } finally {
      setAdBusy(false);
    }
  };

  return (
    <Modal title="⚡ Energy Shop" onClose={() => gameStore.setShopOpen(false)}>
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-8 w-8" />
          <div>
            <div className="text-[11px] text-slate-400">Current energy</div>
            <div className="text-lg tabular-nums text-slate-800">
              {data.energy} / {data.maxEnergy}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm tabular-nums text-amber-800 ring-1 ring-amber-200">
          <CoinIcon className="h-4 w-4" />
          {data.coins.toLocaleString('en-US')}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ENERGY_PACKS.map((p) => {
          const price = p.energy === 'full' ? energyFullPrice(data) : p.price;
          const disabled = data.coins < price || (p.energy === 'full' && data.energy >= data.maxEnergy);
          return (
            <button
              key={p.id}
              onClick={() => gameStore.buyEnergy(p.id)}
              className={cx(
                'relative flex flex-col items-center gap-1 rounded-2xl bg-white p-2.5 pt-4 text-center shadow-sm ring-1 ring-black/5 transition active:scale-95',
                disabled ? 'opacity-55' : 'hover:-translate-y-0.5 hover:shadow-md',
              )}
            >
              {p.badge && (
                <span className="absolute -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white shadow">
                  {p.badge}
                </span>
              )}
              <div className="text-3xl">{PACK_ICON[p.id]}</div>
              <div className="text-[13px] leading-tight text-slate-800">{p.label}</div>
              <div className="text-[11px] text-slate-400">{p.desc}</div>
              <div className="mt-1 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs tabular-nums text-amber-800">
                <CoinIcon className="h-3.5 w-3.5" />
                {price}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-linear-to-r from-rose-50 to-amber-50 p-3 ring-1 ring-rose-100">
        <div className="text-3xl">🎁</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-slate-800">Shelter Sponsorship Gift</div>
          <div className="text-[11px] text-slate-500">Get ⚡5 + 10 coins every 3 minutes</div>
        </div>
        <button
          disabled={!giftReady}
          onClick={() => gameStore.claimGift()}
          className={cx(
            'shrink-0 rounded-full px-3.5 py-2 text-sm transition',
            giftReady
              ? 'anim-pulse-soft bg-linear-to-b from-rose-400 to-rose-500 text-white shadow active:scale-95'
              : 'bg-slate-100 tabular-nums text-slate-400',
          )}
        >
          {giftReady ? 'Claim' : timer}
        </button>
      </div>

      <button
        disabled={adBusy || data.energy >= data.maxEnergy}
        onClick={watchEnergyAd}
        className={cx(
          'mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition',
          adBusy || data.energy >= data.maxEnergy
            ? 'bg-slate-100 text-slate-400'
            : 'anim-pulse-soft bg-linear-to-b from-violet-500 to-purple-600 text-white shadow active:scale-95',
        )}
      >
        🎬 {adBusy ? 'Loading ad...' : 'Watch an ad for +15 energy'}
      </button>
      {giftReady && (
        <button
          disabled={adBusy}
          onClick={watchGiftAd}
          className="mt-2 w-full rounded-2xl bg-white px-3 py-2 text-xs text-slate-500 ring-1 ring-black/5 transition active:scale-95 disabled:opacity-50"
        >
          🎬 Watch an ad to double the sponsorship gift
        </button>
      )}

      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
        Energy refills by 1 every {ENERGY_REGEN_MS / 1000} seconds · Ad rewards work alongside coin purchases
      </p>
    </Modal>
  );
}

export default function ShopModal() {
  const snap = useGame();
  if (!snap.shopOpen) return null;
  return <ShopContent data={snap.data} />;
}
