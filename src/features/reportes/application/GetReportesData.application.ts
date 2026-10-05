import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { ReportesRepository } from "@/features/reportes/domain/Reportes.repository";
import type { ReportesData, ReportesPeriod } from "@/features/reportes/types";
import {
  aggregateExpensesByCategory,
  aggregateIncomeVsExpenses,
  calculateAverageExpense,
} from "@/features/reportes/utils/aggregate";
import {
  canNavigateForward,
  getAverageLabel,
  getNowInLaPaz,
  getPeriodLabel,
  getPeriodRange,
  getRangeLabel,
  parseReportesPeriod,
} from "@/features/reportes/utils/period";
import type { TransactionCurrency } from "@/features/transactions/domain/models";

export function parseReportesCurrency(
  value: string | undefined | null
): TransactionCurrency {
  if (value === "BOB" || value === "USD") return value;
  return "BOB";
}

export class GetReportesData {
  constructor(private readonly reportesRepository: ReportesRepository) {}

  async execute(options: {
    period?: string | null;
    currency?: string | null;
    offset?: string | null;
    colors: ReadonlyMap<string, string>;
  }): Promise<ServiceResult<ReportesData>> {
    const period: ReportesPeriod = parseReportesPeriod(options.period);
    const currency = parseReportesCurrency(options.currency);
    const offset = parseInt(options.offset || "0", 10);
    const now = getNowInLaPaz();

    const range = getPeriodRange(period, offset, now);
    const periodLabel = getPeriodLabel(period, offset, now);
    const rangeLabel = getRangeLabel(period, offset);
    const averageLabel = getAverageLabel(period);
    const canGoForward = canNavigateForward(period, offset, now);

    const result = await this.reportesRepository.listConfirmedInRange({
      currency,
      from: range.from,
      to: range.to,
    });

    if (!result.success) {
      return result;
    }

    const transactions = result.data;

    // Calculate totals
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "INCOME") {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    const balance = income - expense;
    const isEmpty = transactions.length === 0;

    // Calculate average expense
    const averageExpense = calculateAverageExpense(expense, period, range);

    // Aggregate data for charts
    const incomeVsExpenses = aggregateIncomeVsExpenses(
      transactions,
      period,
      range
    );
    const expensesByCategory = aggregateExpensesByCategory(
      transactions,
      options.colors
    );

    return {
      success: true,
      data: {
        period,
        currency,
        periodLabel,
        rangeLabel,
        averageExpense,
        averageLabel,
        totalPeriod: expense,
        income,
        expense,
        balance,
        incomeVsExpenses,
        expensesByCategory,
        isEmpty,
        canNavigateForward: canGoForward,
      },
    };
  }
}
