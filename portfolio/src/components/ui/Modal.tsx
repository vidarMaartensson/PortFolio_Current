import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { gsap, lockScroll, prefersMotion } from "../../lib/motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  /** "stage" fills the screen for the playable demos; "sheet" fits its content. */
  size?: "stage" | "sheet";
  children: ReactNode;
}

export function Modal({ isOpen, onClose, label, size = "sheet", children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Stay mounted until the exit animation has finished.
  if (isOpen && !mounted) setMounted(true);

  const finish = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;
    if (isOpen) {
      lockScroll(true);
      const previous = document.activeElement as HTMLElement | null;
      closeRef.current?.focus({ preventScroll: true });
      if (prefersMotion()) {
        gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
        gsap.fromTo(panel, { y: 60, scale: 0.94, clipPath: "inset(12% 8% 12% 8% round 36px)" }, { y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 0.8, ease: "expo.out", clearProps: "clipPath" });
      }
      return () => {
        lockScroll(false);
        previous?.focus?.({ preventScroll: true });
      };
    }
    const duration = prefersMotion() ? 0.25 : 0;
    gsap.to(panel, { y: 40, scale: 0.97, duration, ease: "power2.in" });
    gsap.to(root, { autoAlpha: 0, duration, onComplete: finish });
  }, [isOpen, mounted, finish]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div ref={rootRef} className="modal" onClick={onClose} data-lenis-prevent>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={label} className={`modal__panel modal__panel--${size}`} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
