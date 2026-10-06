"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { Portal } from "@/components/ui/Portal";

type BottomSheetProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Se muestra junto al botón de cerrar. */
  headerAccessory?: ReactNode;
};

const DISMISS_OFFSET_PX = 96;
const DISMISS_VELOCITY = 600;

export function BottomSheet({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  headerAccessory,
}: BottomSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (
      info.offset.y > DISMISS_OFFSET_PX ||
      info.velocity.y > DISMISS_VELOCITY
    ) {
      onClose();
    }
  }

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain sm:items-center sm:p-6">
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
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              className="glass relative flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-[2rem] border border-border bg-surface shadow-card sm:rounded-[2rem]"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.55 }}
              onDragEnd={handleDragEnd}
            >
              <div className="flex shrink-0 flex-col gap-1 px-5 pt-3 pb-3">
                <div
                  aria-hidden
                  className="mx-auto mb-2 h-1 w-10 rounded-full bg-track"
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2
                      id={titleId}
                      className="font-display text-xl font-extrabold tracking-[-0.03em] text-foreground"
                    >
                      {title}
                    </h2>
                    {description ? (
                      <p
                        id={descriptionId}
                        className="mt-1 text-sm text-pretty text-muted-foreground"
                      >
                        {description}
                      </p>
                    ) : null}
                  </div>
                  {headerAccessory ? (
                    <div className="ml-auto shrink-0">{headerAccessory}</div>
                  ) : null}
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-foreground transition active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      aria-hidden
                      className="h-4 w-4"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3">
                {children}
              </div>

              {footer ? (
                <div className="shrink-0 border-t border-border px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}
