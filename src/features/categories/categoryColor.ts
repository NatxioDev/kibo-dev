const CATEGORY_COLORS = [
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#14b8a6",
  "#ec4899",
  "#6366f1",
  "#06b6d4",
  "#84cc16",
  "#d946ef",
  "#0ea5e9",
  "#8b5cf6",
  "#a16207",
] as const;

const UNCATEGORIZED_COLOR = "#a8a29e";

export type CategoryColorMap = ReadonlyMap<string, string>;

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Must receive the user's full category list so every screen resolves the
 * same colors. Colors are distinct within each type while it has no more
 * categories than the palette.
 */
export function categoryColors(
  categories: readonly { id: string; type: string }[],
): CategoryColorMap {
  const colors = new Map<string, string>();
  const usedByType = new Map<string, Set<number>>();
  const sorted = [...categories].sort((a, b) => a.id.localeCompare(b.id));

  for (const { id, type } of sorted) {
    const used = usedByType.get(type) ?? new Set<number>();
    usedByType.set(type, used);

    let index = hash(id) % CATEGORY_COLORS.length;
    if (used.size < CATEGORY_COLORS.length) {
      while (used.has(index)) index = (index + 1) % CATEGORY_COLORS.length;
    }
    used.add(index);
    colors.set(id, CATEGORY_COLORS[index]);
  }

  return colors;
}

export function categoryColorOf(
  colors: CategoryColorMap,
  categoryId: string | null | undefined,
) {
  if (!categoryId) return UNCATEGORIZED_COLOR;
  return (
    colors.get(categoryId) ??
    CATEGORY_COLORS[hash(categoryId) % CATEGORY_COLORS.length]
  );
}

/** Translucent tint for icon backgrounds. */
export function categoryTint(color: string) {
  return `${color}40`;
}
