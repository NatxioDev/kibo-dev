export type ReportPeriod = "S" | "M" | "6M" | "A";

export type ReportRange = {
  from: string;
  to: string;
};

export type ReportBucket = {
  key: string;
  label: string;
  title: string;
  income: number;
  expense: number;
  balance: number;
  future: boolean;
};

export type ReportCategory = {
  categoryId: string | null;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
};

export type ReportData = {
  range: ReportRange;
  income: number;
  expense: number;
  balance: number;
  /** Expense per elapsed bucket: per day for S/M, per month for 6M/A. */
  average: number;
  weeklyAverage: number | null;
  buckets: ReportBucket[];
  /** Month view only: the daily buckets grouped 1–7, 8–14… for small screens. */
  weeklyBuckets: ReportBucket[] | null;
  categories: ReportCategory[];
  isEmpty: boolean;
};
