"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListActiveAccounts } from "@/features/accounts/application/ListActiveAccounts.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Account } from "@/features/transactions/domain/models";

export async function listActiveAccountsAction(): Promise<
  ServiceResult<Account[]>
> {
  const { accountRepository } = await createServerDependencies();
  return new ListActiveAccounts(accountRepository).execute();
}
