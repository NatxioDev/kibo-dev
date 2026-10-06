import type { Metadata } from "next";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListCategories } from "@/features/categories/application/ListCategories.application";
import { categoryColorOf, categoryColors } from "@/features/categories/categoryColor";
import { parseDashboardCurrency } from "@/features/dashboard/application/GetDashboardData.application";
import { GetReportData } from "@/features/reports/application/GetReportData.application";
import { ReportsScreen } from "@/features/reports/components/ReportsScreen";
import { parseReportOffset, parseReportPeriod } from "@/features/reports/utils/period";
import { todayDateInputValue } from "@/features/transactions/components/formatters";

export const metadata: Metadata = {
  title: "Reportes · Kibo",
};

type ReportesPageProps = {
  searchParams: Promise<{ period?: string; offset?: string; currency?: string }>;
};

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const params = await searchParams;
  const period = parseReportPeriod(params.period);
  const offset = parseReportOffset(params.offset);
  const currency = parseDashboardCurrency(params.currency);
  const today = todayDateInputValue();

  const { dashboardRepository, categoryRepository } = await createServerDependencies();
  const [result, categoriesResult] = await Promise.all([
    new GetReportData(dashboardRepository).execute({ period, offset, currency, today }),
    new ListCategories(categoryRepository).execute(),
  ]);
  const colors = categoryColors(categoriesResult.success ? categoriesResult.data : []);

  const report = result.success
    ? {
        ...result.data,
        categories: result.data.categories.map((category) => ({
          ...category,
          color: categoryColorOf(colors, category.categoryId),
        })),
      }
    : null;

  return (
    <ReportsScreen
      period={period}
      offset={offset}
      currency={currency}
      today={today}
      report={report}
    />
  );
}
