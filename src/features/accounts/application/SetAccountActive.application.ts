import type { AccountRepository } from "@/features/accounts/domain/Account.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Account } from "@/features/transactions/domain/models";

export class SetAccountActive {
  constructor(private readonly accountRepository: AccountRepository) {}

  execute(id: string, isActive: boolean): Promise<ServiceResult<Account>> {
    return this.accountRepository.setActive(id, isActive);
  }
}
