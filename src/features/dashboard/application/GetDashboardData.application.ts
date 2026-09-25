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
import type {
  ServiceResult,
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
  }): Promise<ServiceResult<DashboardData>> {
    const period: DashboardPeriod = parseDashboardPeriod(options.period);
    const currency = parseDashboardCurrency(options.currency);
    const range = getPeriodRange(period);
    const periodLabel = getPeriodLabel(period);

    const result = await this.dashboardRepository.listConfirmedInRange({
      currency,
      from: range.from,
      to: range.to,
    });

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: aggregateDashboardData(
        result.data,
        period,
        currency,
        periodLabel,
      ),
    };
  }
}
