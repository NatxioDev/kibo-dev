"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

// No `filter` here: a filtered ancestor becomes a backdrop root and breaks the
// backdrop-filter of the glass cards inside it.
const revealVariants: Record<"soft" | "bouncy", Variants> = {
  soft: {
    hidden: { opacity: 0, y: 22, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 220, damping: 24 },
    },
  },
  bouncy: {
    hidden: { opacity: 0, y: 48, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 15, mass: 0.9 },
    },
  },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header";
  spring?: "soft" | "bouncy";
};

/** Must be rendered inside `Stagger`, which drives the hidden/show states. */
export function Reveal({
  children,
  className,
  as = "div",
  spring = "soft",
}: RevealProps) {
  const Component = motion[as];
  return (
    <Component className={className} variants={revealVariants[spring]}>
      {children}
    </Component>
  );
}
