import { useMemo, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { COLLECTION_TIERS, DAILY_REWARDS, gameStore, overallProgress } from '../managers/GameStore';
import type { ToastTone } from '../managers/GameStore';
import { CATEGORIES, CATEGORY_META, ITEM_DATABASE, MergeManager } from '../managers/MergeManager';
import { PET_SPECIES, SHELTER_AREAS } from '../data/shelter';
import { sfx } from '../lib/sfx';
import { BoltIcon, CoinIcon, HeartIcon, Modal, cx } from './ui';
import { asset } from '../lib/assets';

/* ---------------- 토스트 ---------------- */
const TONE: Record<ToastTone, string> = {
  info: 'bg-white/95 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50/95 text-emerald-800 ring-emerald-200',
  warn: 'bg-amber-50/95 text-amber-900 ring-amber-200',
  reward: 'bg-linear-to-r from-rose-50 to-amber-50 text-rose-700 ring-rose-200',
};

export function Toasts() {
  const snap = useGame();
  return (
    <div className="pointer-events-none fixed left-1/2 top-[62px] z-[80] flex w-[min(92vw,440px)] -translate-x-1/2 flex-col items-center gap-2">
      {snap.toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => gameStore.dismissToast(t.id)}
          className={cx(
            'anim-toast-in pointer-events-auto flex w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm shadow-lg ring-1 backdrop-blur',
            TONE[t.tone],
          )}
        >
          <span className="text-lg">{t.icon ?? '🐾'}</span>
          <span className="min-w-0 flex-1">{t.text}</span>
          {!!t.coins && (
            <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
              <CoinIcon className="h-4 w-4" />+{t.coins}
            </span>
          )}
          {!!t.hearts && (
            <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
              <HeartIcon className="h-4 w-4" />+{t.hearts}
            </span>
          )}
          {!!t.energy && (
            <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
              <BoltIcon className="h-4 w-4" />+{t.energy}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- 구역 복원 축하 ---------------- */
const CONFETTI_COLORS = ['#FF6B9D', '#FFC93C', '#6ED6B3', '#8EC5FF', '#B99BFF', '#FF9A3C'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        dur: 2.4 + Math.random() * 2,
        size: 7 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() > 0.55,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-[72] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="anim-confetti absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            backgroundColor: p.color,
            borderRadius: p.round ? 999 : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export function CelebrationModal() {
  const snap = useGame();
  const area = SHELTER_AREAS.find((a) => a.id === snap.celebration);
  if (!area) return null;
  const pet = area.reward.unlockPet ? (PET_SPECIES[area.reward.unlockPet] ?? null) : null;
  const lastArea = SHELTER_AREAS[SHELTER_AREAS.length - 1];
  const isFinal = !!lastArea && area.id === lastArea.id;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4">
      <div
        className="anim-fade-in absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={() => gameStore.closeCelebration()}
      />
      <Confetti />
      <div className="anim-scale-in relative w-full max-w-md overflow-hidden rounded-[30px] bg-white shadow-2xl">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={asset(area.image)} alt={area.name} decoding="async" loading="lazy" className="anim-restore h-full w-full object-cover" />
          <div className="absolute inset-x-0 top-3 flex justify-center">
            <span className="anim-shine rounded-full bg-amber-400 px-4 py-1.5 text-sm text-white shadow-lg">✨ 복원 완료 ✨</span>
          </div>
        </div>
        <div className="p-5 text-center">
          <div className="text-2xl text-slate-800">🎉 {area.name} 복원!</div>
          <p className="mt-1 text-sm text-slate-500">
            {isFinal
              ? '버려졌던 항구 쉼터가 모두의 따뜻한 집으로 다시 태어났어요!'
              : '쉼터가 한층 더 따뜻하고 포근해졌어요.'}
          </p>
          {pet && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl p-3 text-left" style={{ backgroundColor: pet.color }}>
              <img
                src={asset(pet.image)}
                decoding="async"
                loading="lazy"
                alt={pet.label}
                className="anim-float h-16 w-16 rounded-2xl object-cover shadow ring-4 ring-white"
              />
              <div>
                <div className="text-slate-800">새 친구가 쉼터에 왔어요!</div>
                <div className="text-xs text-slate-600">이제 {pet.label} 친구들도 도움을 요청해요 🐾</div>
              </div>
            </div>
          )}
          <ul className="mt-4 space-y-1.5 text-left text-sm text-slate-700">
            {area.rewardText.map((r) => (
              <li key={r} className="rounded-xl bg-amber-50 px-3 py-2">
                {r}
              </li>
            ))}
            <li className="rounded-xl bg-emerald-50 px-3 py-2">⚡ 에너지 가득 충전 보너스!</li>
          </ul>
          <button
            onClick={() => gameStore.closeCelebration()}
            className="anim-pulse-cta mt-5 w-full rounded-full bg-linear-to-b from-amber-400 to-orange-500 py-3 text-lg text-white shadow-lg transition active:scale-[0.98]"
          >
            계속 돌보러 가기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 출석 보상 ---------------- */
export function DailyModal({ streakDay, coins, energy, onClaim, onClose }: { streakDay: number; coins: number; energy: number; onClaim: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="anim-fade-in absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-scale-in relative w-full max-w-sm rounded-[28px] bg-[#FFFBF4] p-5 text-center shadow-2xl">
        <div className="text-5xl">📅</div>
        <h3 className="mt-1 text-xl text-slate-800">출석 {streakDay}일째!</h3>
        <p className="mt-0.5 text-xs text-slate-500">매일 오면 보상이 커져요 · 7일 뒤엔 1일차부터 다시 시작</p>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {DAILY_REWARDS.map((r, i) => (
            <div
              key={i}
              className={cx(
                'rounded-xl px-0.5 py-1.5 text-center ring-1',
                i + 1 < streakDay
                  ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                  : i + 1 === streakDay
                    ? 'bg-amber-100 text-amber-800 ring-amber-300'
                    : 'bg-white text-slate-400 ring-black/5',
              )}
            >
              <div className="text-[10px] font-bold">{i + 1}일</div>
              <div className="text-[9px] tabular-nums">{r.coins}💰</div>
            </div>
          ))}
        </div>
        <button
          onClick={onClaim}
          className="anim-pulse-cta mt-4 w-full rounded-full bg-linear-to-b from-amber-400 to-orange-500 py-3 text-lg text-white shadow-lg transition active:scale-[0.98]"
        >
          💰{coins} + ⚡{energy} 받기
        </button>
        <button onClick={onClose} className="mt-2 w-full py-1 text-xs text-slate-400">
          나중에 받기
        </button>
      </div>
    </div>
  );
}

/* ---------------- 도움말 & 도감 ---------------- */
const STEPS = [
  { icon: '🧺', title: '생성기를 탭해요', text: '사료 창고 · 장난감 상자 · 구급 상자를 탭하면 ⚡1 에너지로 아이템이 나와요.' },
  { icon: '🧩', title: '같은 아이템을 합쳐요', text: '똑같은 아이템 두 개를 드래그해서 겹치면 한 단계 높은 아이템이 돼요. (최대 Lv.7)' },
  { icon: '🐾', title: '친구들의 부탁을 들어줘요', text: '요청 카드와 같은 아이템이 보드에 생기면 “전달하기”! 코인과 하트를 받아요.' },
  { icon: '🏡', title: '쉼터를 복원해요', text: '하트와 코인으로 구역을 복원하면 새로운 동물 친구들이 찾아오고 생성기도 좋아져요.' },
];

export function HelpModal({ onClose }: { onClose: () => void }) {
  const snap = useGame();
  const d = snap.data;
  const total = Object.keys(ITEM_DATABASE).length;

  return (
    <Modal title="📖 게임 방법 & 도감" onClose={onClose} wide>
      <div className="grid gap-2 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-2xl">{s.icon}</div>
            <div>
              <div className="text-sm text-slate-800">
                <span className="mr-1 text-amber-500">{i + 1}.</span>
                {s.title}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-sky-50 p-3 text-xs leading-relaxed text-sky-800 ring-1 ring-sky-100">
        💡 아이템을 탭하면 정보를 보고 판매할 수 있어요 · ✅ 배지가 붙은 아이템은 바로 전달할 수 있어요 · 요청 카드의
        아이콘을 누르면 보드에서 찾아줘요 · 에너지는 15초마다 1씩 회복돼요
      </div>

      <h4 className="mb-2 mt-5 text-base text-slate-800">
        📚 아이템 도감{' '}
        <span className="text-xs text-slate-400">
          ({d.discoveredItems.length}/{total})
        </span>
      </h4>
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {COLLECTION_TIERS.map((t) => {
          const claimed = d.claimedCollection.includes(t.count);
          const ready = d.discoveredItems.length >= t.count && !claimed;
          return (
            <button
              key={t.count}
              disabled={!ready}
              onClick={() => gameStore.claimCollection(t.count)}
              className={cx(
                'rounded-2xl px-2 py-2 text-center text-[11px] ring-1 transition active:scale-95 disabled:opacity-70',
                claimed
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : ready
                    ? 'anim-pulse-soft bg-amber-100 text-amber-800 ring-amber-300'
                    : 'bg-white text-slate-400 ring-black/5',
              )}
            >
              <div className="font-bold">
                {claimed ? '✅' : '🏆'} {t.count}종
              </div>
              <div className="tabular-nums">
                {claimed ? '수령 완료' : `💰${t.coins} ⚡${t.energy}`}
              </div>
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} className="rounded-2xl p-2.5" style={{ backgroundColor: meta.soft }}>
              <div className="mb-1.5 text-xs" style={{ color: meta.dark }}>
                {meta.generatorEmoji} {meta.label} · {meta.generatorName}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {MergeManager.getChain(cat).map((it) => {
                  const known = d.discoveredItems.includes(it.id);
                  return (
                    <div key={it.id} title={known ? it.name : '???'} className="flex flex-col items-center">
                      <div
                        className={cx(
                          'grid aspect-square w-full max-w-[52px] place-items-center rounded-xl text-xl shadow-sm ring-2 ring-white sm:text-2xl',
                          !known && 'text-sm text-slate-400',
                        )}
                        style={{ background: known ? `linear-gradient(180deg, ${meta.light}, ${meta.mid})` : '#E2E8F0' }}
                      >
                        {known ? it.emoji : '?'}
                      </div>
                      <span className="mt-0.5 text-[9px] text-slate-500">Lv.{it.level}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={onClose}
        className="mt-5 w-full rounded-full bg-linear-to-b from-orange-400 to-orange-500 py-3 text-lg text-white shadow-lg transition active:scale-[0.98]"
      >
        알겠어요! 🐾
      </button>
    </Modal>
  );
}

/* ---------------- 설정 ---------------- */
export function SettingsModal({ onClose, onHelp }: { onClose: () => void; onHelp: () => void }) {
  const snap = useGame();
  const d = snap.data;
  const [muted, setMuted] = useState(sfx.isMuted());
  const [confirm, setConfirm] = useState(false);

  const toggle = () => {
    const next = !muted;
    sfx.setMuted(next);
    setMuted(next);
    if (!next) sfx.tap();
  };

  const stats = [
    { label: '돌본 친구', value: `${d.stats.ordersCompleted}마리`, icon: '🐾' },
    { label: '합치기', value: `${d.stats.mergesDone}회`, icon: '🧩' },
    { label: '만든 아이템', value: `${d.stats.itemsSpawned}개`, icon: '📦' },
    { label: '쉼터 복원도', value: `${Math.round(overallProgress(d) * 100)}%`, icon: '🏡' },
  ];

  return (
    <Modal title="⚙️ 설정" onClose={onClose}>
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5"
      >
        <span className="text-sm text-slate-700">{muted ? '🔇' : '🔊'} 효과음</span>
        <span className={cx('relative h-7 w-12 rounded-full transition', muted ? 'bg-slate-300' : 'bg-emerald-400')}>
          <span
            className={cx('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', muted ? 'left-1' : 'left-6')}
          />
        </span>
      </button>
      <button
        onClick={() => {
          onClose();
          onHelp();
        }}
        className="mt-2 flex w-full items-center justify-between rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm ring-1 ring-black/5"
      >
        📖 게임 방법 & 도감 <span className="text-slate-300">›</span>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5">
            <div className="text-xl">{s.icon}</div>
            <div className="mt-0.5 text-lg tabular-nums text-slate-800">{s.value}</div>
            <div className="text-[11px] text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (!confirm) {
            setConfirm(true);
            return;
          }
          gameStore.reset();
          setConfirm(false);
          onClose();
        }}
        className={cx(
          'mt-4 w-full rounded-2xl py-3 text-sm transition',
          confirm ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100',
        )}
      >
        {confirm ? '정말 초기화할까요? 한 번 더 누르면 모든 진행이 사라져요' : '🗑️ 진행 초기화'}
      </button>
      <p className="mt-3 text-center text-[11px] text-slate-400">진행 상황은 이 브라우저에 자동 저장돼요 (localStorage)</p>
    </Modal>
  );
}
