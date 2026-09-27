import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRENCY_CODES, type CurrencyCode } from "@/core/domain/value-objects";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import type {
  AttentionShare,
  ExpenseEditContext,
  ExpenseStatus,
  FriendSplitDetail,
  HistoryEvent,
  HomeDebtSummary,
  PersonBalance,
  ResolvedSplit,
  ServiceResult,
  SettlementStatus,
  SettlementView,
  ShareStatus,
  SplitWriteResult,
  TransactionSplitLink,
} from "@/features/splits/domain/models";
import type { SplitRepository } from "@/features/splits/domain/Split.repository";
import {
  pairBalance,
  type BalanceEntry,
  type BalanceSettlement,
  type BalanceShare,
} from "@/features/splits/domain/balance";
import { fromCents, toCents } from "@/features/splits/domain/splitAmount";
import { mapSplitError } from "@/features/splits/infrastructure/supabase/mapSplitError";

const NOT_AUTHENTICATED = "Debes iniciar sesión para ver los gastos compartidos.";

type DebtRow = BalanceEntry & {
  id: string;
  sharedExpenseId: string | null;
  createdAt: string;
};

type ShareRow = BalanceShare & {
  id: string;
  expenseId: string;
  date: string;
  merchant: string | null;
  description: string | null;
  categoryNameSnapshot: string | null;
  transactionId: string | null;
  consumes: boolean;
  createdAt: string;
  expenseCreatedAt: string;
  totalAmount: number;
};

type SettlementRow = BalanceSettlement & {
  id: string;
  createdAt: string;
  confirmedAt: string | null;
  initiatedBy: "debtor" | "creditor";
};

type Graph = {
  me: string;
  entries: DebtRow[];
  shares: ShareRow[];
  settlements: SettlementRow[];
  profiles: Map<string, FriendProfile>;
};

function asNumber(value: number | string): number {
  return typeof value === "string" ? Number(value) : value;
}

function asDate(value: string): string {
  return value.slice(0, 10);
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function fail<T>(error: { message: string; code?: string }): ServiceResult<T> {
  return { success: false, error: mapSplitError(error) };
}

function personName(profile: FriendProfile): string {
  return profile.display_name ?? (profile.username ? `@${profile.username}` : "Usuario");
}

function profileOf(graph: Graph, id: string): FriendProfile {
  return (
    graph.profiles.get(id) ?? {
      id,
      username: null,
      display_name: null,
      avatar_url: null,
    }
  );
}

function otherIds(graph: Graph): string[] {
  const ids = new Set<string>();
  for (const entry of graph.entries) {
    if (entry.debtorId !== graph.me) ids.add(entry.debtorId);
    if (entry.creditorId !== graph.me) ids.add(entry.creditorId);
  }
  for (const share of graph.shares) {
    if (share.userId !== graph.me) ids.add(share.userId);
    if (share.payerId !== graph.me) ids.add(share.payerId);
  }
  for (const settlement of graph.settlements) {
    if (settlement.debtorId !== graph.me) ids.add(settlement.debtorId);
    if (settlement.creditorId !== graph.me) ids.add(settlement.creditorId);
  }
  ids.delete(graph.me);
  return [...ids];
}

function personBalance(graph: Graph, userId: string): PersonBalance {
  const balances = CURRENCY_CODES.flatMap((currency) => {
    const pair = pairBalance(
      graph.entries,
      graph.shares,
      graph.settlements,
      graph.me,
      userId,
      currency,
    );
    const touched =
      pair.net !== 0 ||
      pair.inReview ||
      pair.theyCanPay > 0 ||
      pair.iCanPay > 0 ||
      graph.entries.some(
        (entry) =>
          entry.currency === currency &&
          (entry.debtorId === userId || entry.creditorId === userId),
      );
    return touched ? [pair] : [];
  });

  return {
    profile: profileOf(graph, userId),
    balances,
    hasHistory:
      graph.shares.some(
        (share) => share.userId === userId || share.payerId === userId,
      ) ||
      graph.settlements.some(
        (settlement) =>
          settlement.debtorId === userId || settlement.creditorId === userId,
      ),
    pendingSettlement: graph.settlements.some(
      (settlement) =>
        settlement.status === "pending" &&
        (settlement.debtorId === userId || settlement.creditorId === userId),
    ),
  };
}

function amountsLocked(
  graph: Graph,
  expenseId: string,
  currency: CurrencyCode,
  expenseCreatedAt: string,
  partyIds: string[],
): boolean {
  return graph.settlements.some((settlement) => {
    if (settlement.status !== "confirmed" || !settlement.confirmedAt) return false;
    if (settlement.currency !== currency) return false;
    if (settlement.confirmedAt < expenseCreatedAt) return false;
    const other =
      settlement.debtorId === graph.me
        ? settlement.creditorId
        : settlement.creditorId === graph.me
          ? settlement.debtorId
          : null;
    return other != null && partyIds.includes(other);
  }) && graph.shares.some((share) => share.expenseId === expenseId);
}

export class SupabaseSplitRepository implements SplitRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async userId(): Promise<string | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error || !user) return null;
    return user.id;
  }

  private async loadGraph(): Promise<ServiceResult<Graph>> {
    const me = await this.userId();
    if (!me) return { success: false, error: NOT_AUTHENTICATED };

    const [entriesResult, sharesResult, settlementsResult] = await Promise.all([
      this.supabase
        .from("debt_entries")
        .select("id, debtor_id, creditor_id, amount, currency, shared_expense_id, created_at"),
      this.supabase.from("shared_expense_shares").select(
        `
          id, shared_expense_id, user_id, amount, consumes, status,
          category_name_snapshot, transaction_id, created_at,
          expense:shared_expenses (
            id, payer_id, total_amount, currency, date, merchant, description, status, created_at
          )
        `,
      ),
      this.supabase
        .from("settlements")
        .select(
          "id, debtor_id, creditor_id, amount, currency, status, initiated_by, created_at, confirmed_at",
        ),
    ]);

    if (entriesResult.error) return fail(entriesResult.error);
    if (sharesResult.error) return fail(sharesResult.error);
    if (settlementsResult.error) return fail(settlementsResult.error);

    const shares: ShareRow[] = [];
    for (const row of sharesResult.data ?? []) {
      const expense = one(
        row.expense as unknown as
          | {
              id: string;
              payer_id: string;
              total_amount: number | string;
              currency: CurrencyCode;
              date: string;
              merchant: string | null;
              description: string | null;
              status: ExpenseStatus;
              created_at: string;
            }
          | {
              id: string;
              payer_id: string;
              total_amount: number | string;
              currency: CurrencyCode;
              date: string;
              merchant: string | null;
              description: string | null;
              status: ExpenseStatus;
              created_at: string;
            }[]
          | null,
      );
      if (!expense) continue;
      shares.push({
        id: row.id,
        userId: row.user_id,
        amount: asNumber(row.amount),
        status: row.status as ShareStatus,
        currency: expense.currency,
        payerId: expense.payer_id,
        expenseStatus: expense.status,
        expenseId: expense.id,
        date: asDate(expense.date),
        merchant: expense.merchant,
        description: expense.description,
        categoryNameSnapshot: row.category_name_snapshot,
        transactionId: row.transaction_id,
        consumes: row.consumes,
        createdAt: row.created_at,
        expenseCreatedAt: expense.created_at,
        totalAmount: asNumber(expense.total_amount),
      });
    }

    const entries: DebtRow[] = (entriesResult.data ?? []).map((row) => ({
      id: row.id,
      debtorId: row.debtor_id,
      creditorId: row.creditor_id,
      amount: asNumber(row.amount),
      currency: row.currency as CurrencyCode,
      sharedExpenseId: row.shared_expense_id,
      createdAt: row.created_at,
    }));

    const settlements: SettlementRow[] = (settlementsResult.data ?? []).map((row) => ({
      id: row.id,
      debtorId: row.debtor_id,
      creditorId: row.creditor_id,
      amount: asNumber(row.amount),
      currency: row.currency as CurrencyCode,
      status: row.status as SettlementStatus,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
      initiatedBy: row.initiated_by,
    }));

    const ids = new Set<string>();
    for (const share of shares) {
      ids.add(share.userId);
      ids.add(share.payerId);
    }
    for (const settlement of settlements) {
      ids.add(settlement.debtorId);
      ids.add(settlement.creditorId);
    }
    ids.delete(me);

    const profiles = new Map<string, FriendProfile>();
    if (ids.size > 0) {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", [...ids]);
      if (error) return fail(error);
      for (const profile of data ?? []) {
        profiles.set(profile.id, profile);
      }
    }

    return { success: true, data: { me, entries, shares, settlements, profiles } };
  }

  async createExpense(split: ResolvedSplit): Promise<ServiceResult<SplitWriteResult>> {
    const { data, error } = await this.supabase.rpc("create_shared_expense", {
      p_total: split.totalAmount,
      p_currency: split.currency,
      p_date: split.date,
      p_merchant: split.merchant,
      p_description: split.description,
      p_payer_consumes: split.payerConsumes,
      p_payer_amount: split.payerAmount,
      p_category_id: split.categoryId,
      p_payment_method_id: split.paymentMethodId,
      p_participants: split.participants.map((item) => ({
        user_id: item.userId,
        amount: item.amount,
      })),
    });

    if (error) return fail(error);
    const payload = data as { expense_id: string; transaction_id: string | null };
    return {
      success: true,
      data: {
        expenseId: payload.expense_id,
        transactionId: payload.transaction_id,
      },
    };
  }

  async replaceExpense(
    expenseId: string,
    split: ResolvedSplit,
  ): Promise<ServiceResult<SplitWriteResult>> {
    const { data, error } = await this.supabase.rpc("replace_shared_expense", {
      p_expense_id: expenseId,
      p_total: split.totalAmount,
      p_currency: split.currency,
      p_date: split.date,
      p_merchant: split.merchant,
      p_description: split.description,
      p_payer_consumes: split.payerConsumes,
      p_payer_amount: split.payerAmount,
      p_category_id: split.categoryId,
      p_payment_method_id: split.paymentMethodId,
      p_participants: split.participants.map((item) => ({
        user_id: item.userId,
        amount: item.amount,
      })),
    });

    if (error) return fail(error);
    const payload = data as { expense_id: string; transaction_id: string | null };
    return {
      success: true,
      data: {
        expenseId: payload.expense_id,
        transactionId: payload.transaction_id,
      },
    };
  }

  async updateExpenseDetails(
    expenseId: string,
    details: Pick<
      ResolvedSplit,
      "date" | "merchant" | "description" | "categoryId" | "paymentMethodId"
    >,
  ): Promise<ServiceResult<null>> {
    const { error } = await this.supabase.rpc("update_shared_expense_details", {
      p_expense_id: expenseId,
      p_date: details.date,
      p_merchant: details.merchant,
      p_description: details.description,
      p_category_id: details.categoryId,
      p_payment_method_id: details.paymentMethodId,
    });
    if (error) return fail(error);
    return { success: true, data: null };
  }

  async voidExpense(expenseId: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase.rpc("void_shared_expense", {
      p_expense_id: expenseId,
    });
    if (error) return fail(error);
    return { success: true, data: null };
  }

  async classifyShare(
    shareId: string,
    categoryId: string,
  ): Promise<ServiceResult<{ transactionId: string }>> {
    const { data, error } = await this.supabase.rpc("classify_share", {
      p_share_id: shareId,
      p_category_id: categoryId,
    });
    if (error) return fail(error);
    return { success: true, data: { transactionId: data as string } };
  }

  async disputeShare(shareId: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase.rpc("dispute_share", {
      p_share_id: shareId,
    });
    if (error) return fail(error);
    return { success: true, data: null };
  }

  async withdrawDispute(shareId: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase.rpc("withdraw_share_dispute", {
      p_share_id: shareId,
    });
    if (error) return fail(error);
    return { success: true, data: null };
  }

  async requestSettlement(input: {
    creditorId: string;
    amount: number;
    currency: CurrencyCode;
  }): Promise<ServiceResult<{ id: string }>> {
    const { data, error } = await this.supabase.rpc("request_settlement", {
      p_creditor_id: input.creditorId,
      p_amount: input.amount,
      p_currency: input.currency,
    });
    if (error) return fail(error);
    return { success: true, data: { id: data as string } };
  }

  async confirmSettlement(settlementId: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase.rpc("confirm_settlement", {
      p_settlement_id: settlementId,
    });
    if (error) return fail(error);
    return { success: true, data: null };
  }

  async rejectSettlement(settlementId: string): Promise<ServiceResult<null>> {
    const { error } = await this.supabase.rpc("reject_settlement", {
      p_settlement_id: settlementId,
    });
    if (error) return fail(error);
    return { success: true, data: null };
  }

  async recordReceivedPayment(input: {
    debtorId: string;
    amount: number;
    currency: CurrencyCode;
  }): Promise<ServiceResult<{ id: string }>> {
    const { data, error } = await this.supabase.rpc("record_received_payment", {
      p_debtor_id: input.debtorId,
      p_amount: input.amount,
      p_currency: input.currency,
    });
    if (error) return fail(error);
    return { success: true, data: { id: data as string } };
  }

  async countAttention(): Promise<
    ServiceResult<{ unclassified: number; disputes: number }>
  > {
    const me = await this.userId();
    if (!me) return { success: false, error: NOT_AUTHENTICATED };

    const { data, error } = await this.supabase
      .from("shared_expense_shares")
      .select("user_id, status, expense:shared_expenses(payer_id, status)")
      .in("status", ["pending", "disputed"]);

    if (error) return fail(error);

    let unclassified = 0;
    let disputes = 0;
    for (const row of data ?? []) {
      const expense = one(
        row.expense as unknown as
          | { payer_id: string; status: ExpenseStatus }
          | { payer_id: string; status: ExpenseStatus }[]
          | null,
      );
      if (!expense || expense.status !== "active") continue;
      if (row.status === "pending" && row.user_id === me) unclassified += 1;
      if (
        row.status === "disputed" &&
        (row.user_id === me || expense.payer_id === me)
      ) {
        disputes += 1;
      }
    }
    return { success: true, data: { unclassified, disputes } };
  }

  async listAttention(): Promise<ServiceResult<AttentionShare[]>> {
    const graph = await this.loadGraph();
    if (!graph.success) return graph;

    const items: AttentionShare[] = [];
    for (const share of graph.data.shares) {
      if (share.expenseStatus !== "active") continue;
      if (share.status !== "pending" && share.status !== "disputed") continue;

      if (share.userId === graph.data.me && share.status === "pending") {
        items.push(toAttention(graph.data, share, "classify"));
      } else if (share.userId === graph.data.me && share.status === "disputed") {
        items.push(toAttention(graph.data, share, "mine"));
      } else if (share.payerId === graph.data.me && share.status === "disputed") {
        items.push(toAttention(graph.data, share, "payer"));
      }
    }

    items.sort((a, b) => b.date.localeCompare(a.date));
    return { success: true, data: items };
  }

  async listPersonBalances(): Promise<ServiceResult<PersonBalance[]>> {
    const graph = await this.loadGraph();
    if (!graph.success) return graph;
    return {
      success: true,
      data: otherIds(graph.data).map((id) => personBalance(graph.data, id)),
    };
  }

  async homeSummary(currency: CurrencyCode): Promise<ServiceResult<HomeDebtSummary>> {
    const graph = await this.loadGraph();
    if (!graph.success) return graph;

    let owedToMe = 0;
    let iOwe = 0;
    let hasHistory = false;

    for (const userId of otherIds(graph.data)) {
      const pair = pairBalance(
        graph.data.entries,
        graph.data.shares,
        graph.data.settlements,
        graph.data.me,
        userId,
        currency,
      );
      if (
        graph.data.entries.some(
          (entry) =>
            entry.currency === currency &&
            (entry.debtorId === userId || entry.creditorId === userId),
        )
      ) {
        hasHistory = true;
      }
      if (pair.net > 0) owedToMe += toCents(pair.net);
      if (pair.net < 0) iOwe += toCents(Math.abs(pair.net));
    }

    return {
      success: true,
      data: {
        currency,
        owedToMe: fromCents(owedToMe),
        iOwe: fromCents(iOwe),
        hasHistory,
      },
    };
  }

  async friendDetail(userId: string): Promise<ServiceResult<FriendSplitDetail>> {
    const graph = await this.loadGraph();
    if (!graph.success) return graph;
    if (userId === graph.data.me) {
      return { success: false, error: "No encontramos a esa persona." };
    }

    const { data: friendships, error } = await this.supabase
      .from("friendships")
      .select("status, requester_id, addressee_id")
      .or(`requester_id.eq.${graph.data.me},addressee_id.eq.${graph.data.me}`);

    if (error) return fail(error);

    const friendship = (friendships ?? []).find(
      (row) =>
        (row.requester_id === graph.data.me && row.addressee_id === userId) ||
        (row.addressee_id === graph.data.me && row.requester_id === userId),
    );

    const person = personBalance(graph.data, userId);
    const isFriend = friendship?.status === "accepted";
    if (!isFriend && !person.hasHistory) {
      return { success: false, error: "No encontramos a esa persona." };
    }

    let profile = person.profile;
    if (!graph.data.profiles.has(userId)) {
      const { data: profileRow, error: profileError } = await this.supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (profileError) return fail(profileError);
      if (profileRow) profile = profileRow;
    }

    const history = buildHistory(graph.data, userId);
    const pendingSettlements: SettlementView[] = graph.data.settlements
      .filter(
        (settlement) =>
          settlement.status === "pending" &&
          (settlement.debtorId === userId || settlement.creditorId === userId),
      )
      .map((settlement) => ({
        id: settlement.id,
        debtorId: settlement.debtorId,
        creditorId: settlement.creditorId,
        amount: settlement.amount,
        currency: settlement.currency,
        status: settlement.status,
        initiatedBy: settlement.initiatedBy,
        createdAt: settlement.createdAt,
      }));

    return {
      success: true,
      data: {
        profile,
        isFriend,
        balances: person.balances,
        pendingSettlements,
        history,
      },
    };
  }

  async findByTransaction(
    transactionId: string,
  ): Promise<ServiceResult<TransactionSplitLink | null>> {
    const graph = await this.loadGraph();
    if (!graph.success) return graph;

    const share = graph.data.shares.find(
      (item) =>
        item.transactionId === transactionId &&
        item.status !== "voided" &&
        item.expenseStatus === "active",
    );
    if (!share) return { success: true, data: null };

    return {
      success: true,
      data: {
        expenseId: share.expenseId,
        shareId: share.id,
        isPayer: share.payerId === graph.data.me,
        shareAmount: share.amount,
        currency: share.currency,
        expenseStatus: share.expenseStatus,
        payerName: personName(profileOf(graph.data, share.payerId)),
      },
    };
  }

  async getEditContext(expenseId: string): Promise<ServiceResult<ExpenseEditContext>> {
    const graph = await this.loadGraph();
    if (!graph.success) return graph;

    const related = graph.data.shares.filter(
      (share) => share.expenseId === expenseId && share.status !== "voided",
    );
    const payerShare = related.find((share) => share.userId === graph.data.me && share.payerId === graph.data.me);
    if (!payerShare || payerShare.expenseStatus !== "active") {
      return { success: false, error: "No encontramos ese gasto compartido." };
    }

    let categoryId: string | null = null;
    let paymentMethodId: string | null = null;
    if (payerShare.transactionId) {
      const { data, error } = await this.supabase
        .from("transactions")
        .select("category_id, payment_method_id")
        .eq("id", payerShare.transactionId)
        .maybeSingle();
      if (error) return fail(error);
      categoryId = data?.category_id ?? null;
      paymentMethodId = data?.payment_method_id ?? null;
    }

    const participants = related
      .filter((share) => share.userId !== graph.data.me)
      .map((share) => ({ userId: share.userId, amount: share.amount }));

    return {
      success: true,
      data: {
        expenseId,
        isPayer: true,
        totalAmount: payerShare.totalAmount,
        currency: payerShare.currency,
        date: payerShare.date,
        merchant: payerShare.merchant,
        description: payerShare.description,
        payerConsumes: payerShare.consumes,
        payerAmount: payerShare.amount,
        categoryId,
        paymentMethodId,
        transactionId: payerShare.transactionId,
        amountsLocked: amountsLocked(
          graph.data,
          expenseId,
          payerShare.currency,
          payerShare.expenseCreatedAt,
          participants.map((item) => item.userId),
        ),
        participants,
      },
    };
  }
}

function toAttention(
  graph: Graph,
  share: ShareRow,
  role: AttentionShare["role"],
): AttentionShare {
  const counterpartId = role === "payer" ? share.userId : share.payerId;
  return {
    id: share.id,
    amount: share.amount,
    currency: share.currency,
    status: share.status === "disputed" ? "disputed" : "pending",
    categoryNameSnapshot: share.categoryNameSnapshot,
    role,
    date: share.date,
    merchant: share.merchant,
    description: share.description,
    counterpart: profileOf(graph, counterpartId),
  };
}

function buildHistory(graph: Graph, userId: string): HistoryEvent[] {
  const events: HistoryEvent[] = [];

  for (const share of graph.shares) {
    const involves =
      (share.payerId === graph.me && share.userId === userId) ||
      (share.userId === graph.me && share.payerId === userId);
    if (!involves || share.userId === share.payerId) continue;

    const parties = graph.shares
      .filter((item) => item.expenseId === share.expenseId && item.userId !== graph.me)
      .map((item) => item.userId);

    events.push({
      id: share.id,
      at: share.createdAt,
      date: share.date,
      kind: "expense",
      amount: share.amount,
      currency: share.currency,
      merchant: share.merchant,
      description: share.description,
      shareStatus: share.status,
      settlementStatus: null,
      theyOwe: share.payerId === graph.me,
      iAmPayer: share.payerId === graph.me,
      expenseId: share.expenseId,
      amountsLocked: amountsLocked(
        graph,
        share.expenseId,
        share.currency,
        share.expenseCreatedAt,
        parties,
      ),
    });
  }

  for (const settlement of graph.settlements) {
    const involves =
      (settlement.debtorId === graph.me && settlement.creditorId === userId) ||
      (settlement.creditorId === graph.me && settlement.debtorId === userId);
    if (!involves || settlement.status === "rejected") continue;

    events.push({
      id: settlement.id,
      at: settlement.createdAt,
      date: asDate(settlement.createdAt),
      kind: "payment",
      amount: settlement.amount,
      currency: settlement.currency,
      merchant: null,
      description: null,
      shareStatus: null,
      settlementStatus: settlement.status,
      theyOwe: settlement.debtorId === userId,
      iAmPayer: false,
      expenseId: null,
      amountsLocked: false,
    });
  }

  events.sort((a, b) => b.at.localeCompare(a.at));
  return events;
}
