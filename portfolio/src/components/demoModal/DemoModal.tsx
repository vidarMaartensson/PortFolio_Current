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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} demo`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <h3 className="font-bold text-white">{title} – demo</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close demo"
                className="rounded-md px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>
            <PausableGif
              src={gifUrl}
              alt={`${title} demo`}
              className="block max-h-[80vh] w-full object-contain"
            />
            <p className="px-4 py-2 text-center text-xs text-slate-400">
              Click the demo to pause or play
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
