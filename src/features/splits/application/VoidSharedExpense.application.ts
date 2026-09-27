import type { SplitRepository } from "@/features/splits/domain/Split.repository";
import type { ServiceResult } from "@/features/splits/domain/models";

export class VoidSharedExpense {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(expenseId: string): Promise<ServiceResult<null>> {
    return this.splitRepository.voidExpense(expenseId);
  }
}
