import type { Category } from "@/features/transactions/types";

export function formatCategoryLabel(
  category: Pick<Category, "name" | "icon"> | null | undefined,
): string {
  if (!category) return "📦 Sin categoría";
  const icon = category.icon?.trim() || "📦";
  return `${icon} ${category.name}`;
}
