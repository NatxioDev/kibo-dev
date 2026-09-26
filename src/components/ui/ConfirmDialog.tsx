"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Portal } from "@/components/ui/Portal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  loading: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  loading,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <Portal>
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="glass relative w-full max-w-sm rounded-[2rem] border border-border bg-surface p-6 shadow-card"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <h2
              id={titleId}
              className="font-display text-xl font-extrabold tracking-[-0.03em] text-balance text-foreground"
            >
              {title}
            </h2>
            <div id={descriptionId} className="mt-2 text-sm text-pretty text-muted-foreground">
              {description}
            </div>

            {error ? (
              <p className="mt-3 text-sm text-expense" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={onConfirm}
                disabled={loading}
                variant="danger"
                size="lg"
                className="w-full"
              >
                {loading ? pendingLabel : confirmLabel}
              </Button>
              <Button
                ref={cancelRef}
                onClick={onClose}
                disabled={loading}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
    </Portal>
  );
}
