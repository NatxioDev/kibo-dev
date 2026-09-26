"use client";

import { motion } from "motion/react";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative flex h-8 w-13 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 disabled:opacity-60 ${
        checked ? "justify-end bg-income" : "justify-start bg-track"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 34 }}
        className="h-7 w-7 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.2)]"
      />
    </button>
  );
}
