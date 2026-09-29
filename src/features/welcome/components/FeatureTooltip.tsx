"use client";

import { AnimatePresence, motion } from "motion/react";

type FeatureTooltipProps = {
  id: string;
  open: boolean;
  text: string;
  align: "start" | "center" | "end";
  placement: "above" | "below";
};

const alignClass: Record<FeatureTooltipProps["align"], string> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

export function FeatureTooltip({
  id,
  open,
  text,
  align,
  placement,
}: FeatureTooltipProps) {
  const offset = placement === "above" ? 6 : -6;

  return (
    <AnimatePresence>
      {open ? (
        <motion.span
          id={id}
          role="tooltip"
          initial={{ opacity: 0, y: offset, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: offset, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`pointer-events-none absolute z-20 w-44 rounded-2xl border border-border bg-background/90 backdrop-blur-xl backdrop-saturate-150 px-3.5 py-2.5 text-left text-sm leading-snug font-medium text-foreground shadow-card ${alignClass[align]} ${placement === "above" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {text}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
