"use client";

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef } from "react";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import type { TransactionCurrency } from "@/features/transactions/types";

type AnimatedNumberProps = {
  value: number;
  currency: TransactionCurrency;
  className?: string;
};

// Tween instead of spring: a money figure must never overshoot its real value.
export function AnimatedNumber({ value, currency, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const current = useMotionValue(0);
  const label = formatMoneyAmount(value, currency);

  useEffect(() => {
    if (reduceMotion) {
      current.jump(value);
      return;
    }
    const controls = animate(current, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [current, reduceMotion, value]);

  useMotionValueEvent(current, "change", (latest) => {
    if (ref.current) ref.current.textContent = formatMoneyAmount(latest, currency);
  });

  return (
    <span ref={ref} className={className} aria-label={label}>
      {label}
    </span>
  );
}
