"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const containerVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.04 },
  }),
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

export function Stagger({ children, className, stagger = 0.07 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      custom={stagger}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}
