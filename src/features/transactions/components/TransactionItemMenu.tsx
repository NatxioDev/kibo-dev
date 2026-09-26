"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Portal } from "@/components/ui/Portal";

type TransactionItemMenuProps = {
  label: string;
  editHref: string;
  onDelete: () => void;
};

function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

const MENU_WIDTH = 176;
const MENU_HEIGHT = 104;

export function TransactionItemMenu({
  label,
  editHref,
  onDelete,
}: TransactionItemMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef(false);
  const open = position !== null;

  function openMenu(fromKeyboard: boolean) {
    focusOnOpen.current = fromKeyboard;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fitsBelow = rect.bottom + MENU_HEIGHT + 8 < window.innerHeight;
    setPosition({
      top: fitsBelow ? rect.bottom + 6 : rect.top - MENU_HEIGHT - 6,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  }

  function close(restoreFocus = false) {
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;

    if (focusOnOpen.current) {
      menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setPosition(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPosition(null);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [],
      );
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === "ArrowDown"
          ? (index + 1) % items.length
          : (index - 1 + items.length) % items.length;
      event.preventDefault();
      items[next]?.focus();
    }

    function handleScroll() {
      setPosition(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  const itemClass =
    "flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => (open ? close() : openMenu(event.detail === 0))}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        aria-label={`Opciones de ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden
        >
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      <Portal>
            <AnimatePresence>
              {position ? (
                <motion.div
                  ref={menuRef}
                  role="menu"
                  aria-label={`Opciones de ${label}`}
                  style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
                  className="glass fixed! z-50 flex flex-col rounded-2xl border border-border bg-surface p-1.5 shadow-card"
                  initial={{ opacity: 0, scale: 0.9, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                >
                  <Link
                    href={editHref}
                    role="menuitem"
                    onClick={() => close()}
                    className={`${itemClass} text-foreground`}
                  >
                    <PencilIcon />
                    Editar
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      close();
                      onDelete();
                    }}
                    className={`${itemClass} text-expense`}
                  >
                    <TrashIcon />
                    Eliminar…
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
      </Portal>
    </>
  );
}
