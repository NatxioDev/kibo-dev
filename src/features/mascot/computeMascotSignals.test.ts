import { describe, expect, it } from "vitest";
import {
  computeMascotSignals,
  getMascotSignalsRange,
  toLocalDateString,
  type MascotSignalTransaction,
} from "./computeMascotSignals";

const TODAY = "2026-10-06";
const options = { today: TODAY, currency: "BOB" as const };

function income(date: string, amount: number, currency: "BOB" | "USD" = "BOB"): MascotSignalTransaction {
  return { type: "INCOME", amount, currency, date };
}

function expense(date: string, currency: "BOB" | "USD" = "BOB"): MascotSignalTransaction {
  return { type: "EXPENSE", amount: 10, currency, date };
}

const history = [income("2026-08-01", 100), income("2026-08-20", 100), income("2026-09-10", 100)];

describe("computeMascotSignals · unexpectedIncome", () => {
  it("es false sin movimientos", () => {
    expect(computeMascotSignals([], options)).toEqual({
      unexpectedIncome: false,
      manyExpensesToday: false,
    });
  });

  it("requiere al menos 3 ingresos de historial", () => {
    const twoPrevious = [income("2026-08-01", 100), income("2026-09-10", 100)];
    expect(computeMascotSignals([...twoPrevious, income(TODAY, 1000)], options).unexpectedIncome).toBe(
      false,
    );
  });

  it("es true cuando el ingreso reciente supera 1.5× el promedio", () => {
    expect(computeMascotSignals([...history, income(TODAY, 151)], options).unexpectedIncome).toBe(true);
  });

  it("exactamente 1.5× no cuenta", () => {
    expect(computeMascotSignals([...history, income(TODAY, 150)], options).unexpectedIncome).toBe(false);
  });

  it("cuenta ingresos de hasta 2 días atrás y no de 3", () => {
    expect(computeMascotSignals([...history, income("2026-10-04", 500)], options).unexpectedIncome).toBe(
      true,
    );
    expect(computeMascotSignals([...history, income("2026-10-03", 500)], options).unexpectedIncome).toBe(
      false,
    );
  });

  it("solo usa como historial los 90 días previos a ese ingreso", () => {
    const old = [income("2026-06-01", 100), income("2026-06-15", 100), income("2026-07-01", 100)];
    expect(computeMascotSignals([...old, income(TODAY, 500)], options).unexpectedIncome).toBe(false);
  });

  it("ignora otra moneda", () => {
    const usdHistory = history.map((t) => ({ ...t, currency: "USD" as const }));
    expect(computeMascotSignals([...usdHistory, income(TODAY, 500)], options).unexpectedIncome).toBe(
      false,
    );
    expect(computeMascotSignals([...history, income(TODAY, 500, "USD")], options).unexpectedIncome).toBe(
      false,
    );
  });

  it("ignora ingresos con fecha futura", () => {
    expect(computeMascotSignals([...history, income("2026-10-07", 500)], options).unexpectedIncome).toBe(
      false,
    );
  });
});

describe("computeMascotSignals · manyExpensesToday", () => {
  it("4 gastos hoy no alcanzan", () => {
    const expenses = Array.from({ length: 4 }, () => expense(TODAY));
    expect(computeMascotSignals(expenses, options).manyExpensesToday).toBe(false);
  });

  it("5 gastos hoy sí", () => {
    const expenses = Array.from({ length: 5 }, () => expense(TODAY));
    expect(computeMascotSignals(expenses, options).manyExpensesToday).toBe(true);
  });

  it("no cuenta gastos de ayer ni de otra moneda", () => {
    const expenses = [
      ...Array.from({ length: 4 }, () => expense(TODAY)),
      expense("2026-10-05"),
      expense(TODAY, "USD"),
    ];
    expect(computeMascotSignals(expenses, options).manyExpensesToday).toBe(false);
  });
});

describe("helpers de fechas", () => {
  it("el rango cubre 90 días antes del ingreso reciente más antiguo", () => {
    expect(getMascotSignalsRange(TODAY)).toEqual({ from: "2026-07-06", to: TODAY });
  });

  it("formatea la fecha local", () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});
