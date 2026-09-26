import type { ReactNode } from "react";

type AlertProps = {
  tone?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
};

const toneClass = {
  error: "border-expense-border bg-expense-soft text-expense-strong",
  success: "border-income/30 bg-income/10 text-income",
  info: "border-border bg-surface-muted text-foreground",
};

export function Alert({ tone = "error", children, className = "" }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm text-pretty ${toneClass[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
