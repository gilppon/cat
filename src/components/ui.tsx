import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

/** @deprecated cn을 직접 사용 권장. 호환용 별칭. */
export const cx = cn;

interface IconProps {
  className?: string;
}

export function CoinIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12.6" r="10.6" fill="#E39A00" />
      <circle cx="12" cy="11.4" r="10.2" fill="#FFC928" />
      <circle cx="12" cy="11.4" r="7" fill="#FFDB5E" stroke="#E9A100" strokeWidth="1.2" />
      <path
        d="M12 7l1.35 2.75 3.03.44-2.19 2.13.52 3.02L12 13.92l-2.71 1.42.52-3.02-2.19-2.13 3.03-.44z"
        fill="#F2A000"
      />
    </svg>
  );
}

export function HeartIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21.2s-7.6-4.7-9.7-9.3C.8 8.5 2.6 4.5 6.4 4.1c2.2-.2 3.9 1 5.6 3.1 1.7-2.1 3.4-3.3 5.6-3.1 3.8.4 5.6 4.4 4.1 7.8-2.1 4.6-9.7 9.3-9.7 9.3z"
        fill="#FF4D8D"
        stroke="#FFFFFF"
        strokeWidth="1.4"
      />
      <ellipse cx="7.6" cy="8.4" rx="2.1" ry="1.3" fill="#FFFFFF" opacity="0.55" transform="rotate(-30 7.6 8.4)" />
    </svg>
  );
}

export function BoltIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M13.6 1.8 4.4 13.6h6.2l-1.2 8.6 9.3-11.9h-6.3z"
        fill="#FFC21A"
        stroke="#E08A00"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="anim-fade-in absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cx(
          'anim-sheet-in soft-scroll relative max-h-[88dvh] w-full overflow-y-auto rounded-[28px] bg-[#FFFBF4] shadow-2xl ring-1 ring-white',
          wide ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-amber-100 bg-[#FFFBF4]/95 px-5 pb-3 pt-4 backdrop-blur">
          <h3 className="text-xl text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow ring-1 ring-black/5 transition hover:text-slate-800 active:scale-90"
          >
            ✕
          </button>
        </div>
        <div className="p-5 pt-4">{children}</div>
      </div>
    </div>
  );
}
