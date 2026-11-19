import { describe, expect, it } from "vitest";
import {
  CATEGORY_GRID_LIMIT,
  filterCategories,
  gridCategories,
} from "@/features/transactions/domain/categoryPicker";
import type { Category } from "@/features/transactions/domain/models";

function category(id: string, name: string): Category {
  return {
    id,
    name,
    user_id: "u1",
    type: "EXPENSE",
    icon: null,
    is_active: true,
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  };
}

const categories = [
  category("1", "Comida"),
  category("2", "Transporte"),
  category("3", "Casa"),
  category("4", "Salud"),
  category("5", "Ocio"),
  category("6", "Ropa"),
  category("7", "Educación"),
  category("8", "Mascotas"),
  category("9", "Regalos"),
];

describe("gridCategories", () => {
  it("muestra solo las primeras, en el orden que llega del servidor", () => {
    const grid = gridCategories(categories, "");
    expect(grid).toHaveLength(CATEGORY_GRID_LIMIT);
    expect(grid[0].id).toBe("1");
    expect(grid.at(-1)?.id).toBe("7");
  });

  it("deja visible la categoría elegida aunque no esté en el top", () => {
    const grid = gridCategories(categories, "9");
    expect(grid).toHaveLength(CATEGORY_GRID_LIMIT);
    expect(grid.at(-1)?.id).toBe("9");
    expect(grid.some((item) => item.id === "7")).toBe(false);
  });

  it("no duplica la elegida cuando ya está en el top", () => {
    const grid = gridCategories(categories, "3");
    expect(grid).toHaveLength(CATEGORY_GRID_LIMIT);
    expect(grid.filter((item) => item.id === "3")).toHaveLength(1);
  });
});

describe("filterCategories", () => {
  it("busca por nombre sin distinguir mayúsculas", () => {
    expect(filterCategories(categories, "com").map((item) => item.id)).toEqual(["1"]);
    expect(filterCategories(categories, "  COM ").map((item) => item.id)).toEqual(["1"]);
  });

  it("devuelve todo con la búsqueda vacía", () => {
    expect(filterCategories(categories, "")).toHaveLength(categories.length);
    expect(filterCategories(categories, "no existe")).toHaveLength(0);
  });
});
