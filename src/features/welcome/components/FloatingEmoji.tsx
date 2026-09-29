"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
} from "react";
import {
  MOBILE_LOGO_ANCHOR,
  type WelcomeEmoji,
} from "@/features/welcome/content/features";
import { FeatureTooltip } from "./FeatureTooltip";

type FloatingEmojiProps = {
  item: WelcomeEmoji;
  index: number;
  layout: "mobile" | "desktop";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
};

const sizeClass: Record<WelcomeEmoji["size"], string> = {
  sm: "text-2xl lg:text-3xl",
  md: "text-3xl lg:text-4xl",
  lg: "text-4xl lg:text-5xl",
};

function alignFor(value: number, [startBelow, endAbove]: [number, number]) {
  if (value < startBelow) return "start" as const;
  if (value > endAbove) return "end" as const;
  return "center" as const;
}

export function FloatingEmoji({
  item,
  index,
  layout,
  open,
  onOpenChange: setOpen,
  pointerX,
  pointerY,
}: FloatingEmojiProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const x = useTransform(pointerX, (v) => v * item.depth);
  const y = useTransform(pointerY, (v) => v * item.depth);
  const tooltipId = `welcome-feature-${item.id}`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  const mobile = layout === "mobile" ? item.mobile : undefined;
  const position = mobile
    ? { top: `calc(50% + ${mobile.y}px)`, left: `calc(50% + ${mobile.x}px)` }
    : { top: `${item.desktop.top}%`, left: `${item.desktop.left}%` };

  const entry = mobile
    ? {
        initial: {
          opacity: 0,
          scale: 0.3,
          x: MOBILE_LOGO_ANCHOR.x - mobile.x,
          y: MOBILE_LOGO_ANCHOR.y - mobile.y,
        },
        transition: {
          delay: 0.35 + index * 0.06,
          type: "spring" as const,
          stiffness: 150,
          damping: 13,
        },
      }
    : {
        initial: { opacity: 0, scale: 0.6, x: 0, y: 0 },
        transition: {
          delay: 0.45 + index * 0.07,
          type: "spring" as const,
          stiffness: 200,
          damping: 20,
        },
      };

  const float = {
    "--float-x": `${item.float.x}px`,
    "--float-y": `${item.float.y}px`,
    "--float-rot": `${item.float.rotate}deg`,
    "--float-dur": `${item.float.duration}s`,
    "--float-delay": `${item.float.delay}s`,
  } as CSSProperties;

  const glyph = (
    <span
      aria-hidden
      className={`block leading-none select-none ${sizeClass[item.size]} ${item.twinkle ? "motion-safe:animate-twinkle" : ""}`}
    >
      {item.emoji}
    </span>
  );

  return (
    <motion.span
      ref={rootRef}
      style={{ ...position, x, y }}
      className={`absolute block -translate-x-1/2 -translate-y-1/2 ${open ? "z-30" : "z-0"}`}
    >
      <motion.span
        className="block"
        initial={entry.initial}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={entry.transition}
      >
        <span className="block motion-safe:animate-float" style={float}>
          <motion.button
            type="button"
            aria-label={item.label}
            aria-describedby={open ? tooltipId : undefined}
            whileHover={{ scale: 1.15, rotate: -6 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            onPointerEnter={(event: PointerEvent) => {
              if (event.pointerType === "mouse") setOpen(true);
            }}
            onPointerLeave={(event: PointerEvent) => {
              if (event.pointerType === "mouse") setOpen(false);
            }}
            onPointerDown={(event: PointerEvent) => {
              if (event.pointerType !== "mouse") setOpen(!open);
            }}
            onFocus={(event: FocusEvent<HTMLButtonElement>) => {
              if (event.currentTarget.matches(":focus-visible")) setOpen(true);
            }}
            onBlur={() => setOpen(false)}
            className="pointer-events-auto grid h-11 w-11 cursor-help place-items-center rounded-full lg:h-16 lg:w-16"
          >
            {glyph}
          </motion.button>
        </span>
      </motion.span>
      <FeatureTooltip
        id={tooltipId}
        open={open}
        text={item.label}
        align={
          mobile
            ? alignFor(mobile.x, [-60, 60])
            : alignFor(item.desktop.left, [35, 65])
        }
        placement={!mobile && item.desktop.top > 50 ? "above" : "below"}
      />
    </motion.span>
  );
}
