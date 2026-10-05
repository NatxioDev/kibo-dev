"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Segmented } from "@/components/ui/Segmented";
import type { ReportesPeriod } from "@/features/reportes/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ReportesPeriodSelectorProps = {
  period: ReportesPeriod;
  offset: number;
  canNavigateForward: boolean;
};

const PERIOD_OPTIONS: { value: ReportesPeriod; label: string }[] = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "6M", label: "6M" },
  { value: "A", label: "A" },
];

export function ReportesPeriodSelector({
  period,
  offset,
  canNavigateForward,
}: ReportesPeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePeriodChange = (newPeriod: ReportesPeriod) => {
    updateParams({ period: newPeriod, offset: "0" });
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const newOffset = direction === "prev" ? offset - 1 : offset + 1;
    updateParams({ offset: String(newOffset) });
  };

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="Período"
        value={period}
        options={PERIOD_OPTIONS}
        onChange={handlePeriodChange}
        size="md"
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handleNavigate("prev")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-opacity hover:bg-surface-muted disabled:opacity-40"
          aria-label="Período anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 text-center">
          <div className="font-semibold text-sm text-foreground">
            {period === "S" && "esta semana"}
            {period === "M" && "este mes"}
            {period === "6M" && "últimos 6 meses"}
            {period === "A" && "este año"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleNavigate("next")}
          disabled={!canNavigateForward}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-opacity hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Período siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
