"use client";

import { Segmented } from "@/components/ui/Segmented";
import type { ReportPeriod } from "@/features/reports/types";
import { REPORT_PERIODS } from "@/features/reports/utils/period";

const PERIOD_OPTIONS = REPORT_PERIODS.map(({ value, label }) => ({
  value,
  label: (
    <>
      <span aria-hidden>{value}</span>
      <span className="sr-only">{label}</span>
    </>
  ),
}));

type PeriodNavigatorProps = {
  period: ReportPeriod;
  offset: number;
  rangeLabel: string;
  relativeLabel: string;
  onPeriodChange: (period: ReportPeriod) => void;
  onStep: (direction: -1 | 1) => void;
};

export function PeriodNavigator({
  period,
  offset,
  rangeLabel,
  relativeLabel,
  onPeriodChange,
  onStep,
}: PeriodNavigatorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="Período"
        value={period}
        options={PERIOD_OPTIONS}
        onChange={onPeriodChange}
      />
      <div className="flex items-center gap-2">
        <StepButton direction={-1} onStep={onStep} />
        <div className="min-w-0 flex-1 text-center" aria-live="polite">
          <p className="font-display text-base font-bold tracking-[-0.02em] text-balance text-foreground">
            {rangeLabel}
          </p>
          <p className="text-xs text-muted-foreground">{relativeLabel}</p>
        </div>
        <StepButton direction={1} onStep={onStep} disabled={offset >= 0} />
      </div>
    </div>
  );
}

function StepButton({
  direction,
  onStep,
  disabled = false,
}: {
  direction: -1 | 1;
  onStep: (direction: -1 | 1) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onStep(direction)}
      disabled={disabled}
      aria-label={direction === -1 ? "Período anterior" : "Período siguiente"}
      className="glass inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-card transition-[background-color,opacity,transform] duration-150 hover:bg-surface-muted active:scale-[0.92] disabled:pointer-events-none disabled:opacity-35"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d={direction === -1 ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
      </svg>
    </button>
  );
}
