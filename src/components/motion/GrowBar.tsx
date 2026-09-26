"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";

type GrowBarProps = {
  percent: number;
  className?: string;
  style?: CSSProperties;
  delay?: number;
};

export function GrowBar({ percent, className, style, delay = 0 }: GrowBarProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay }}
    />
  );
}
