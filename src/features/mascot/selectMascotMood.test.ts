import { describe, expect, it } from "vitest";
import { selectMascotMood } from "./selectMascotMood";
import { NO_MASCOT_SIGNALS } from "./types";

function input(overrides: {
  isEmpty?: boolean;
  income?: number;
  expense?: number;
  balance?: number;
  unexpectedIncome?: boolean;
  manyExpensesToday?: boolean;
}) {
  const income = overrides.income ?? 100;
  const expense = overrides.expense ?? 100;
  return {
    isEmpty: overrides.isEmpty ?? false,
    income,
    expense,
    balance: overrides.balance ?? income - expense,
    signals: {
      ...NO_MASCOT_SIGNALS,
      unexpectedIncome: overrides.unexpectedIncome ?? false,
      manyExpensesToday: overrides.manyExpensesToday ?? false,
    },
  };
}

describe("selectMascotMood", () => {
  it("error → mareado", () => {
    expect(selectMascotMood({ error: true })).toBe("mareado");
  });

  it("sin movimientos → durmiendo, aunque haya señales", () => {
    expect(selectMascotMood(input({ isEmpty: true, manyExpensesToday: true }))).toBe("durmiendo");
  });

  it("muchos gastos hoy → mareado, por encima del ingreso inesperado", () => {
    expect(selectMascotMood(input({ manyExpensesToday: true, unexpectedIncome: true }))).toBe(
      "mareado",
    );
  });

  it("ingreso inesperado → sorprendido, por encima de gastos > ingresos", () => {
    expect(selectMascotMood(input({ unexpectedIncome: true, income: 50, expense: 100 }))).toBe(
      "sorprendido",
    );
  });

  it("gastos > ingresos → preocupado", () => {
    expect(selectMascotMood(input({ income: 90, expense: 100 }))).toBe("preocupado");
  });

  it("ingresos 0 con gastos → preocupado", () => {
    expect(selectMascotMood(input({ income: 0, expense: 10 }))).toBe("preocupado");
  });

  it("ingresos ≥ 1.2× gastos con balance positivo → feliz", () => {
    expect(selectMascotMood(input({ income: 120, expense: 100 }))).toBe("feliz");
  });

  it("solo ingresos → feliz", () => {
    expect(selectMascotMood(input({ income: 50, expense: 0 }))).toBe("feliz");
  });

  it("ingresos = gastos → idle", () => {
    expect(selectMascotMood(input({ income: 100, expense: 100 }))).toBe("idle");
  });

  it("balance positivo pero por debajo de 1.2× → idle", () => {
    expect(selectMascotMood(input({ income: 119, expense: 100 }))).toBe("idle");
  });

  it("balance 0 con ingresos y gastos en 0 → idle", () => {
    expect(selectMascotMood(input({ income: 0, expense: 0 }))).toBe("idle");
  });
});
