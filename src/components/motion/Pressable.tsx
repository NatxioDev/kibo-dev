"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type PressableProps = {
  children: ReactNode;
  className?: string;
  scale?: number;
};

export function Pressable({ children, className, scale = 0.97 }: PressableProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
