import { useCallback, useEffect, useState } from 'react';
import { useGame } from './hooks/useGame';
import { canAffordAnyTask, gameStore } from './managers/GameStore';
import { sfx, startMusic } from './lib/sfx';
import TitleScreen from './components/TitleScreen';
import TopBar from './components/TopBar';
import OrdersPanel from './components/OrdersPanel';
import PhaserBoard from './components/PhaserBoard';
import ItemInfoBar from './components/ItemInfoBar';
import ShelterPanel from './components/ShelterPanel';
import TutorialOverlay from './components/TutorialOverlay';
import AdOverlay, { type AdState } from './components/AdOverlay';
import { Ads, registerAdUI } from './lib/ads';
import ShopModal from './components/ShopModal';
import { CelebrationModal, DailyModal, HelpModal, SettingsModal, Toasts } from './components/Overlays';
import { cx } from './components/ui';

interface NavProps {
  shelterOpen: boolean;
  badge: boolean;
  onBoard: () => void;
  onShelter: () => void;
  onShop: () => void;
  onHelp: () => void;
}

function BottomNav({ shelterOpen, badge, onBoard, onShelter, onShop, onHelp }: NavProps) {
  const btn = (active: boolean) =>
    cx(
      'relative flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[11px] transition active:scale-95',
      active ? 'bg-amber-100 text-amber-700' : 'text-slate-500',
    );
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-3 pt-1 lg:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[22px] bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur">
        <button className={btn(!shelterOpen)} onClick={onBoard}>
          <span className="text-xl leading-none">🧩</span>Merge
        </button>
        <button className={btn(shelterOpen)} onClick={onShelter}>
          <span className="text-xl leading-none">🏡</span>Shelter
          {badge && (
            <span className="anim-badge absolute right-3 top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>
        <button className={btn(false)} onClick={onShop}>
          <span className="text-xl leading-none">⚡</span>Shop
        </button>
        <button className={btn(false)} onClick={onHelp}>
          <span className="text-xl leading-none">📖</span>Help
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [shelterOpen, setShelterOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ad, setAd] = useState<AdState | null>(null);
  const [dailyDismissed, setDailyDismissed] = useState(false);
  const snap = useGame();
  const badge = canAffordAnyTask(snap.data);
  const daily = gameStore.dailyStatus();
  const showDaily = started && !dailyDismissed && daily.available;

  // Ad SDK init + mock-ad UI registration
  useEffect(() => {
    registerAdUI((kind, done) => setAd({ kind, done }));
    void Ads.init();
    return () => registerAdUI(null);
  }, []);

  // Portal-compliant focus handling: Phaser already freezes the scene on blur,
  // but the portal must also stop counting gameplay time in the background.
  useEffect(() => {
    if (!started) return;
    const onAway = () => {
      if (document.hidden) Ads.gameplayStop();
    };
    const onBack = () => {
      if (!document.hidden) Ads.gameplayStart();
    };
    const onBlur = () => Ads.gameplayStop();
    const onFocus = () => Ads.gameplayStart();

    document.addEventListener('visibilitychange', onAway);
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onAway);
      document.removeEventListener('visibilitychange', onBack);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [started]);

  // Automatic energy regen (kept separate from TopBar's useNow 1s timer: tick updates the
  // store, useNow only drives the display)
  useEffect(() => {
    const id = window.setInterval(() => gameStore.tick(), 1000);
    return () => window.clearInterval(id);
  }, []);

  const start = () => {
    sfx.unlock();
    setStarted(true);
    Ads.gameplayStart();
    // Music needs the same first gesture as the AudioContext itself.
    startMusic();
    // The first playthrough is guided by the interactive tutorial, so skip auto-opening HelpModal
    if (gameStore.live.tutorialSeen) return;
    setHelpOpen(false);
  };

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
  }, []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openShop = useCallback(() => gameStore.setShopOpen(true), []);

  if (!started) return <TitleScreen onStart={start} />;

  return (
    <div className="app-bg flex h-[100dvh] flex-col overflow-hidden text-slate-800">
      <TopBar
        onShop={openShop}
        onMenu={() => setMenuOpen(true)}
        onShelter={() => setShelterOpen(true)}
        shelterBadge={badge}
      />

      <div className="flex min-h-0 flex-1 gap-3 px-2 pb-2 sm:px-3 lg:pb-3">
        {/* Desktop: order list */}
        <aside className="hidden w-[272px] shrink-0 flex-col lg:flex">
          <OrdersPanel layout="column" />
        </aside>

        {/* Board area */}
        <main className="no-scrollbar flex min-h-0 min-w-0 flex-1 flex-col items-center gap-2 overflow-y-auto pb-[78px] lg:overflow-visible lg:pb-0">
          <div className="w-full shrink-0 lg:hidden">
            <OrdersPanel layout="row" />
          </div>
          <div className="relative min-h-[320px] w-full max-w-[640px] flex-1">
            <PhaserBoard />
          </div>
          <ItemInfoBar />
        </main>

        {/* Wide desktop: shelter restore panel */}
        <aside className="hidden w-[400px] shrink-0 overflow-hidden rounded-[28px] shadow-xl ring-1 ring-black/5 xl:flex">
          <ShelterPanel />
        </aside>
      </div>

      <BottomNav
        shelterOpen={shelterOpen}
        badge={badge}
        onBoard={() => setShelterOpen(false)}
        onShelter={() => setShelterOpen((o) => !o)}
        onShop={openShop}
        onHelp={() => setHelpOpen(true)}
      />

      {shelterOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="anim-fade-in absolute inset-0 hidden bg-slate-900/40 lg:block" onClick={() => setShelterOpen(false)} />
          <div className="anim-sheet-in absolute inset-0 lg:left-auto lg:w-[440px] lg:shadow-2xl">
            <ShelterPanel onClose={() => setShelterOpen(false)} />
          </div>
        </div>
      )}

      <ShopModal />
      <CelebrationModal />
      <TutorialOverlay />
      {showDaily && (
        <DailyModal
          streakDay={daily.streakDay}
          coins={daily.coins}
          energy={Math.min(daily.energy, snap.data.maxEnergy - snap.data.energy)}
          onClaim={() => {
            gameStore.claimDaily();
            setDailyDismissed(true);
          }}
          onClose={() => setDailyDismissed(true)}
        />
      )}
      {ad && (
        <AdOverlay
          kind={ad.kind}
          onDone={(ok) => {
            setAd(null);
            ad.done(ok);
          }}
        />
      )}
      {helpOpen && <HelpModal onClose={closeHelp} />}
      {menuOpen && <SettingsModal onClose={closeMenu} onHelp={() => setHelpOpen(true)} />}
      <Toasts />
    </div>
  );
}
