import { describe, expect, it } from "vitest";
import type { DashboardQuery, DashboardRepository } from "@/features/dashboard/domain/Dashboard.repository";
import type { DashboardData } from "@/features/dashboard/types";
import { selectMascotMood } from "@/features/mascot/selectMascotMood";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { TransactionWithRelations } from "@/features/transactions/domain/models";
import { GetDashboardData } from "./GetDashboardData.application";

const NOW = new Date(2026, 9, 6, 12);

let nextId = 0;
function tx(type: "INCOME" | "EXPENSE", amount: number, date: string): TransactionWithRelations {
  nextId += 1;
  return {
    id: `tx-${nextId}`,
    user_id: "user",
    account_id: null,
    category_id: null,
    payment_method_id: null,
    type,
    amount,
    currency: "BOB",
    date,
    merchant: null,
    description: null,
    source: "MANUAL",
    status: "CONFIRMED",
    created_at: `${date}T12:00:00Z`,
    updated_at: `${date}T12:00:00Z`,
    account: null,
    category: null,
    payment_method: null,
  };
}

class FakeDashboardRepository implements DashboardRepository {
  queries: DashboardQuery[] = [];
  pending = 0;
  maxPending = 0;

  constructor(
    private readonly transactions: TransactionWithRelations[],
    private readonly failWhen: (query: DashboardQuery) => boolean = () => false,
  ) {}

  async listConfirmedInRange(query: DashboardQuery): Promise<ServiceResult<TransactionWithRelations[]>> {
    this.queries.push(query);
    this.pending += 1;
    this.maxPending = Math.max(this.maxPending, this.pending);
    await Promise.resolve();
    this.pending -= 1;

    if (this.failWhen(query)) return { success: false, error: "boom" };
    return {
      success: true,
      data: this.transactions.filter(
        (t) => t.currency === query.currency && t.date >= query.from && t.date <= query.to,
      ),
    };
  }
}

async function load(repository: DashboardRepository): Promise<DashboardData> {
  const result = await new GetDashboardData(repository).execute({
    period: "this_month",
    currency: "BOB",
    now: NOW,
  });
  if (!result.success) throw new Error(result.error);
  return result.data;
}

function moodOf(data: DashboardData) {
  return selectMascotMood({ ...data, signals: data.mascot });
}

const incomeHistory = [
  tx("INCOME", 100, "2026-07-15"),
  tx("INCOME", 100, "2026-08-15"),
  tx("INCOME", 100, "2026-09-15"),
];

describe("GetDashboardData · mascota", () => {
  it("consulta el período y los 90 días de señales en paralelo", async () => {
    const repository = new FakeDashboardRepository([]);
    await load(repository);
    expect(repository.maxPending).toBe(2);
    expect(repository.queries).toEqual([
      { currency: "BOB", from: "2026-10-01", to: "2026-10-31" },
      { currency: "BOB", from: "2026-07-06", to: "2026-10-06" },
    ]);
  });

  it("sin movimientos → durmiendo", async () => {
    expect(moodOf(await load(new FakeDashboardRepository([])))).toBe("durmiendo");
  });

  it("gastos > ingresos → preocupado", async () => {
    const data = await load(
      new FakeDashboardRepository([tx("INCOME", 100, "2026-10-02"), tx("EXPENSE", 150, "2026-10-03")]),
    );
    expect(moodOf(data)).toBe("preocupado");
  });

  it("buen balance → feliz", async () => {
    const data = await load(
      new FakeDashboardRepository([tx("INCOME", 300, "2026-10-01"), tx("EXPENSE", 100, "2026-10-03")]),
    );
    expect(moodOf(data)).toBe("feliz");
  });

  it("ingreso inesperado → sorprendido", async () => {
    const data = await load(new FakeDashboardRepository([...incomeHistory, tx("INCOME", 400, "2026-10-05")]));
    expect(data.mascot.unexpectedIncome).toBe(true);
    expect(moodOf(data)).toBe("sorprendido");
  });

  it("5 gastos hoy → mareado", async () => {
    const expenses = Array.from({ length: 5 }, () => tx("EXPENSE", 10, "2026-10-06"));
    const data = await load(new FakeDashboardRepository([tx("INCOME", 500, "2026-10-01"), ...expenses]));
    expect(data.mascot.manyExpensesToday).toBe(true);
    expect(moodOf(data)).toBe("mareado");
  });

  it("si falla la consulta de señales, quedan en false y el dashboard carga", async () => {
    const expenses = Array.from({ length: 5 }, () => tx("EXPENSE", 10, "2026-10-06"));
    const repository = new FakeDashboardRepository(expenses, (query) => query.from === "2026-07-06");
    const data = await load(repository);
    expect(data.mascot).toEqual({ unexpectedIncome: false, manyExpensesToday: false });
    expect(data.expense).toBe(50);
  });

  it("si falla la consulta del período, devuelve el error", async () => {
    const repository = new FakeDashboardRepository([], (query) => query.from === "2026-10-01");
    const result = await new GetDashboardData(repository).execute({
      period: "this_month",
      currency: "BOB",
      now: NOW,
    });
    expect(result).toEqual({ success: false, error: "boom" });
  });
});
