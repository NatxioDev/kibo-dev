import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type {
  TransactionPageCursor,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";
import {
  NO_ACCOUNT_LABEL,
  type ExportRow,
} from "@/features/transactions/export/domain/models";
import type { ListTransactionsFilters } from "@/features/transactions/utils/listFilters";

const PAGE_SIZE = 500;

export function toExportRow(transaction: TransactionWithRelations): ExportRow {
  return {
    date: transaction.date,
    type: transaction.type === "INCOME" ? "Ingreso" : "Gasto",
    amount: transaction.amount,
    currency: transaction.currency,
    category: transaction.category?.name ?? "",
    merchant: transaction.merchant ?? "",
    note: transaction.description ?? "",
    account: transaction.account?.name ?? NO_ACCOUNT_LABEL,
    paymentMethod: transaction.payment_method?.name ?? "",
  };
}

/**
 * Reads the filtered transactions page by page (keyset) so exports never hold
 * the whole dataset in memory. Resolves to `null` when nothing matches.
 */
export class ExportTransactions {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly pageSize: number = PAGE_SIZE,
  ) {}

  async execute(
    filters: ListTransactionsFilters,
  ): Promise<ServiceResult<AsyncIterable<ExportRow[]> | null>> {
    const first = await this.transactionRepository.listPage(
      filters,
      null,
      this.pageSize,
    );
    if (!first.success) return first;
    if (first.data.items.length === 0) return { success: true, data: null };

    return {
      success: true,
      data: this.pages(
        filters,
        first.data.items.map(toExportRow),
        first.data.nextCursor,
      ),
    };
  }

  private async *pages(
    filters: ListTransactionsFilters,
    firstRows: ExportRow[],
    firstCursor: TransactionPageCursor | null,
  ): AsyncGenerator<ExportRow[]> {
    yield firstRows;

    let cursor = firstCursor;
    while (cursor) {
      const page = await this.transactionRepository.listPage(
        filters,
        cursor,
        this.pageSize,
      );
      if (!page.success) throw new Error(page.error);
      if (page.data.items.length > 0) {
        yield page.data.items.map(toExportRow);
      }
      cursor = page.data.nextCursor;
    }
  }
}
