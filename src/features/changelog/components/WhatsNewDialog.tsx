"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Portal } from "@/components/ui/Portal";
import { formatReleaseDate, ReleaseSections } from "@/features/changelog/components/ReleaseCard";
import { useWhatsNew } from "@/features/changelog/hooks/useWhatsNew";

const HIDDEN_PREFIXES = ["/login", "/auth", "/onboarding", "/settings/novedades"];

export function WhatsNewDialog() {
  const pathname = usePathname();
  const { unseen, hasUnseen, markSeen } = useWhatsNew();
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const open = hasUnseen && !hidden;

  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primaryRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        markSeen();
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
  }, [open, markSeen]);

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
              onClick={markSeen}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="glass relative flex max-h-[85dvh] w-full max-w-md flex-col rounded-[2rem] border border-border bg-surface shadow-card"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <div className="px-6 pt-6">
                <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Kibo se actualizó
                </p>
                <h2
                  id={titleId}
                  className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] text-balance text-foreground"
                >
                  ¿Qué hay de nuevo?
                </h2>
              </div>

              <div className="mt-4 flex flex-col gap-6 overflow-y-auto px-6">
                {unseen.map((release) => (
                  <section key={release.version} className="flex flex-col gap-3">
                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-lg font-extrabold tracking-[-0.02em] text-foreground tabular-nums">
                          v{release.version}
                        </h3>
                        <time dateTime={release.date} className="shrink-0 text-xs text-muted-foreground">
                          {formatReleaseDate(release.date)}
                        </time>
                      </div>
                      {release.title ? (
                        <p className="text-[0.9375rem] font-semibold text-muted-foreground">
                          {release.title}
                        </p>
                      ) : null}
                    </div>
                    <ReleaseSections release={release} />
                  </section>
                ))}
              </div>

              <div className="flex flex-col gap-2 p-6">
                <Button ref={primaryRef} onClick={markSeen} size="lg" className="w-full">
                  Entendido
                </Button>
                <Button
                  href="/settings/novedades"
                  onClick={markSeen}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Ver todas las novedades
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}
