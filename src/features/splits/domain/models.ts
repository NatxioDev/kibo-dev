import type { CurrencyCode } from "@/core/domain/value-objects";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import type { ServiceResult } from "@/core/domain/ServiceResult";

export type { ServiceResult };

export type ShareStatus = "pending" | "classified" | "disputed" | "voided";
export type ExpenseStatus = "active" | "voided";
export type SettlementStatus = "pending" | "confirmed" | "rejected";

export type SplitDraft = {
  payerConsumes: boolean;
  mode: "equal" | "custom";
  friendIds: string[];
  payerAmount: number;
  friendAmounts: { userId: string; amount: number }[];
};

export type ResolvedSplit = {
  totalAmount: number;
  currency: CurrencyCode;
  date: string;
  merchant: string | null;
  description: string | null;
  payerConsumes: boolean;
  payerAmount: number;
  categoryId: string | null;
  paymentMethodId: string | null;
  participants: { userId: string; amount: number }[];
};

export type SplitWriteResult = {
  expenseId: string;
  transactionId: string | null;
};

export type TransactionSplitLink = {
  expenseId: string;
  shareId: string;
  isPayer: boolean;
  shareAmount: number;
  currency: CurrencyCode;
  expenseStatus: ExpenseStatus;
  payerName: string;
};

export type ExpenseEditContext = {
  expenseId: string;
  isPayer: boolean;
  totalAmount: number;
  currency: CurrencyCode;
  date: string;
  merchant: string | null;
  description: string | null;
  payerConsumes: boolean;
  payerAmount: number;
  categoryId: string | null;
  paymentMethodId: string | null;
  transactionId: string | null;
  amountsLocked: boolean;
  participants: { userId: string; amount: number }[];
};

export type AttentionShare = {
  id: string;
  amount: number;
  currency: CurrencyCode;
  status: "pending" | "disputed";
  categoryNameSnapshot: string | null;
  role: "classify" | "mine" | "payer";
  date: string;
  merchant: string | null;
  description: string | null;
  counterpart: FriendProfile;
};

export type FriendAlertCounts = {
  requests: number;
  unclassified: number;
  disputes: number;
};

export type CurrencyBalance = {
  currency: CurrencyCode;
  net: number;
  theyCanPay: number;
  iCanPay: number;
  inReview: boolean;
};

export type PersonBalance = {
  profile: FriendProfile;
  balances: CurrencyBalance[];
  hasHistory: boolean;
  pendingSettlement: boolean;
};

export type HomeDebtSummary = {
  currency: CurrencyCode;
  owedToMe: number;
  iOwe: number;
  hasHistory: boolean;
};

export type SettlementView = {
  id: string;
  debtorId: string;
  creditorId: string;
  amount: number;
  currency: CurrencyCode;
  status: SettlementStatus;
  initiatedBy: "debtor" | "creditor";
  createdAt: string;
};

export type HistoryEvent = {
  id: string;
  at: string;
  date: string;
  kind: "expense" | "payment";
  amount: number;
  currency: CurrencyCode;
  merchant: string | null;
  description: string | null;
  shareStatus: ShareStatus | null;
  settlementStatus: SettlementStatus | null;
  /** True when the other person owes me for this event. */
  theyOwe: boolean;
  iAmPayer: boolean;
  expenseId: string | null;
  amountsLocked: boolean;
};

export type FriendSplitDetail = {
  profile: FriendProfile;
  isFriend: boolean;
  balances: CurrencyBalance[];
  pendingSettlements: SettlementView[];
  history: HistoryEvent[];
};
