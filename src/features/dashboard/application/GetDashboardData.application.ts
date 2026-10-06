import type { DashboardRepository } from "@/features/dashboard/domain/Dashboard.repository";
import type {
  DashboardData,
  DashboardPeriod,
} from "@/features/dashboard/types";
import { aggregateDashboardData } from "@/features/dashboard/utils/aggregate";
import {
  getPeriodLabel,
  getPeriodRange,
  parseDashboardPeriod,
} from "@/features/dashboard/utils/period";
import {
  computeMascotSignals,
  getMascotSignalsRange,
  toLocalDateString,
} from "@/features/mascot/computeMascotSignals";
import { NO_MASCOT_SIGNALS } from "@/features/mascot/types";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  TransactionCurrency,
} from "@/features/transactions/domain/models";

export function parseDashboardCurrency(
  value: string | undefined | null,
): TransactionCurrency {
  if (value === "BOB" || value === "USD") return value;
  return "BOB";
}

export class GetDashboardData {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(options: {
    period?: string | null;
    currency?: string | null;
    now?: Date;
  }): Promise<ServiceResult<DashboardData>> {
    const now = options.now ?? new Date();
    const period: DashboardPeriod = parseDashboardPeriod(options.period);
    const currency = parseDashboardCurrency(options.currency);
    const range = getPeriodRange(period, now);
    const periodLabel = getPeriodLabel(period, now);
    const today = toLocalDateString(now);
    const signalsRange = getMascotSignalsRange(today);

    const [result, signalsResult] = await Promise.all([
      this.dashboardRepository.listConfirmedInRange({
        currency,
        from: range.from,
        to: range.to,
      }),
      this.dashboardRepository.listConfirmedInRange({
        currency,
        from: signalsRange.from,
        to: signalsRange.to,
      }),
    ]);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        ...aggregateDashboardData(result.data, period, currency, periodLabel),
        mascot: signalsResult.success
          ? computeMascotSignals(signalsResult.data, { today, currency })
          : NO_MASCOT_SIGNALS,
      },
    };
  }
}
