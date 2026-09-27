import type { SplitRepository } from "@/features/splits/domain/Split.repository";
import type { ResolvedSplit, ServiceResult, SplitWriteResult } from "@/features/splits/domain/models";

export class CreateSharedExpense {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(split: ResolvedSplit): Promise<ServiceResult<SplitWriteResult>> {
    return this.splitRepository.createExpense(split);
  }
}
