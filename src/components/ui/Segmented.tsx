"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";

type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
};

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  size?: "md" | "lg";
  className?: string;
};

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}: SegmentedProps<T>) {
  const layoutId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`glass flex gap-1 rounded-control border border-border bg-surface p-1 shadow-card ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`relative flex-1 rounded-control px-3 font-semibold whitespace-nowrap transition-colors duration-200 disabled:opacity-60 ${
              size === "lg" ? "h-11 text-base" : "h-9 text-sm"
            } ${
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className="absolute inset-0 rounded-control bg-primary shadow-card"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            ) : null}
            <span className="relative inline-flex items-center justify-center gap-1.5">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
