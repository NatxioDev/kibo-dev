import type { AccountRepository } from "@/features/accounts/domain/Account.repository";
import type { AccountFormValues } from "@/features/accounts/schemas/accountSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Account } from "@/features/transactions/domain/models";

export class UpdateAccount {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute(
    id: string,
    values: AccountFormValues,
  ): Promise<ServiceResult<Account>> {
    return this.accountRepository.update(id, values);
  }
}
