import type { AccountFormValues } from "@/features/accounts/schemas/accountSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Account } from "@/features/transactions/domain/models";

export interface AccountRepository {
  list(): Promise<ServiceResult<Account[]>>;
  listActive(): Promise<ServiceResult<Account[]>>;
  getById(id: string): Promise<ServiceResult<Account>>;
  create(values: AccountFormValues): Promise<ServiceResult<Account>>;
  update(
    id: string,
    values: AccountFormValues,
  ): Promise<ServiceResult<Account>>;
  setActive(id: string, isActive: boolean): Promise<ServiceResult<Account>>;
}
