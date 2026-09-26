"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export const SPRING = { type: "spring", stiffness: 260, damping: 26 } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      {children}
    </MotionConfig>
  );
}
