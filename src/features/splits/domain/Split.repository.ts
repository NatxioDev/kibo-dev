import type { CurrencyCode } from "@/core/domain/value-objects";
import type {
  AttentionShare,
  ExpenseEditContext,
  FriendSplitDetail,
  HomeDebtSummary,
  PersonBalance,
  ResolvedSplit,
  ServiceResult,
  SettlementWriteResult,
  SharedExpenseDetail,
  SplitWriteResult,
  TransactionSplitLink,
} from "@/features/splits/domain/models";

export interface SplitRepository {
  createExpense(split: ResolvedSplit): Promise<ServiceResult<SplitWriteResult>>;
  replaceExpense(
    expenseId: string,
    split: ResolvedSplit,
  ): Promise<ServiceResult<SplitWriteResult>>;
  updateExpenseDetails(
    expenseId: string,
    details: Pick<
      ResolvedSplit,
      "date" | "merchant" | "description" | "categoryId" | "paymentMethodId"
    >,
  ): Promise<ServiceResult<null>>;
  voidExpense(expenseId: string): Promise<ServiceResult<null>>;
  classifyShare(
    shareId: string,
    categoryId: string,
  ): Promise<ServiceResult<{ transactionId: string }>>;
  disputeShare(shareId: string): Promise<ServiceResult<null>>;
  withdrawDispute(shareId: string): Promise<ServiceResult<null>>;
  requestSettlement(input: {
    creditorId: string;
    amount: number;
    currency: CurrencyCode;
  }): Promise<ServiceResult<SettlementWriteResult>>;
  /** Devuelve los ids de las notificaciones creadas para el deudor. */
  confirmSettlement(settlementId: string): Promise<ServiceResult<string[]>>;
  rejectSettlement(settlementId: string): Promise<ServiceResult<string[]>>;
  recordReceivedPayment(input: {
    debtorId: string;
    amount: number;
    currency: CurrencyCode;
  }): Promise<ServiceResult<SettlementWriteResult>>;
  countAttention(): Promise<
    ServiceResult<{ unclassified: number; disputes: number }>
  >;
  listAttention(): Promise<ServiceResult<AttentionShare[]>>;
  listPersonBalances(): Promise<ServiceResult<PersonBalance[]>>;
  homeSummary(currency: CurrencyCode): Promise<ServiceResult<HomeDebtSummary>>;
  friendDetail(userId: string): Promise<ServiceResult<FriendSplitDetail>>;
  findByTransaction(
    transactionId: string,
  ): Promise<ServiceResult<TransactionSplitLink | null>>;
  getEditContext(
    expenseId: string,
  ): Promise<ServiceResult<ExpenseEditContext>>;
  shareDetail(
    expenseId: string,
  ): Promise<ServiceResult<SharedExpenseDetail>>;
}
