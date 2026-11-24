import type { Category } from "@/features/transactions/domain/models";

export const CATEGORY_GRID_LIMIT = 7;

/**
 * Categorías de la grilla: las más usadas primero (ya vienen ordenadas del
 * repositorio) y, si la elegida no está en el top, entra en lugar de la última
 * para que el formulario siempre muestre la selección.
 */
export function gridCategories(
  categories: Category[],
  selectedId: string,
  limit = CATEGORY_GRID_LIMIT,
): Category[] {
  const top = categories.slice(0, limit);
  const selected = categories.find((category) => category.id === selectedId);
  if (!selected || top.includes(selected)) return top;
  return [...top.slice(0, limit - 1), selected];
}

export function filterCategories(categories: Category[], query: string): Category[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return categories;
  return categories.filter((category) => category.name.toLowerCase().includes(needle));
}
