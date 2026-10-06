import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { DashboardRepository } from "@/features/dashboard/domain/Dashboard.repository";
import type { ReportData, ReportPeriod } from "@/features/reports/types";
import { aggregateReport } from "@/features/reports/utils/aggregate";
import { getReportRange } from "@/features/reports/utils/period";
import type { TransactionCurrency } from "@/features/transactions/types";

export class GetReportData {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(options: {
    period: ReportPeriod;
    offset: number;
    currency: TransactionCurrency;
    today: string;
  }): Promise<ServiceResult<ReportData>> {
    const { period, offset, currency, today } = options;
    const range = getReportRange(period, offset, today);

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
      data: aggregateReport(result.data, period, range, today),
    };
  }
}
