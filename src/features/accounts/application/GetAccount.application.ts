import type { AccountRepository } from "@/features/accounts/domain/Account.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Account } from "@/features/transactions/domain/models";

export class GetAccount {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute(id: string): Promise<ServiceResult<Account>> {
    return this.accountRepository.getById(id);
  }
}
