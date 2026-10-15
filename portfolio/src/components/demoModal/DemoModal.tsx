import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PausableGif } from "./PausableGif";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  gifUrl: string;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  title,
  gifUrl,
}) => {
  // Close on Escape and lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          // Bottom sheet on phones, centered dialog from `sm` up
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} demo`}
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-900 pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-xl sm:pb-0"
          >
            <div className="flex items-center justify-between border-b border-slate-700 py-2 pl-4 pr-2 sm:py-3 sm:pr-4">
              <h3 className="font-bold text-white">{title} – demo</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close demo"
                className="flex h-10 w-10 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white sm:h-8 sm:w-8"
              >
                ✕
              </button>
            </div>
            <PausableGif
              src={gifUrl}
              alt={`${title} demo`}
              className="block max-h-[70svh] w-full object-contain sm:max-h-[80vh]"
            />
            <p className="px-4 py-3 text-center text-xs text-slate-400 sm:py-2">
              <span className="sm:hidden">
                Tap the demo to pause or play · rotate your phone for a bigger
                view
              </span>
              <span className="hidden sm:inline">
                Click the demo to pause or play
              </span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
