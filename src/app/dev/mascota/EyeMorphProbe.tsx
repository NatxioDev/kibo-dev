"use client";

import { motion, useReducedMotion } from "motion/react";
import { EYE_HAPPY, EYE_PILL } from "@/components/mascot/shapes";

export function EyeMorphProbe() {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="-12 -14 24 28" width="48" height="56" aria-hidden>
      <motion.path
        d={EYE_PILL}
        fill="currentColor"
        animate={reduceMotion ? undefined : { d: [EYE_PILL, EYE_HAPPY, EYE_HAPPY, EYE_PILL] }}
        transition={{
          duration: 2,
          times: [0, 0.35, 0.7, 1],
          ease: [
            [0.34, 1.56, 0.64, 1],
            "linear",
            [0.45, 0, 0.55, 1],
          ],
          repeat: Infinity,
          repeatDelay: 0.4,
        }}
      />
    </svg>
  );
}
