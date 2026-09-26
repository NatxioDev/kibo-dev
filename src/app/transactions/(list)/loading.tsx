import { PageSkeleton } from "@/components/PageSkeleton";

export default function TransactionsLoading() {
  return <PageSkeleton rows={6} withToolbar />;
}
