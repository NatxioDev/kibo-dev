"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetAccount } from "@/features/accounts/application/GetAccount.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Account } from "@/features/transactions/domain/models";

export async function getAccountAction(
  id: string,
): Promise<ServiceResult<Account>> {
  const { accountRepository } = await createServerDependencies();
  return new GetAccount(accountRepository).execute(id);
}
