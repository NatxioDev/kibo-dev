import type { CurrencyCode } from "@/core/domain/value-objects";
import type { SplitRepository } from "@/features/splits/domain/Split.repository";
import type { ServiceResult } from "@/features/splits/domain/models";

export class ClassifyShare {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(shareId: string, categoryId: string) {
    return this.splitRepository.classifyShare(shareId, categoryId);
  }
}

export class DisputeShare {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(shareId: string): Promise<ServiceResult<null>> {
    return this.splitRepository.disputeShare(shareId);
  }
}

export class WithdrawShareDispute {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(shareId: string): Promise<ServiceResult<null>> {
    return this.splitRepository.withdrawDispute(shareId);
  }
}

export class RequestSettlement {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(input: { creditorId: string; amount: number; currency: CurrencyCode }) {
    return this.splitRepository.requestSettlement(input);
  }
}

export class ConfirmSettlement {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(settlementId: string) {
    return this.splitRepository.confirmSettlement(settlementId);
  }
}

export class RejectSettlement {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(settlementId: string) {
    return this.splitRepository.rejectSettlement(settlementId);
  }
}

export class RecordReceivedPayment {
  constructor(private readonly splitRepository: SplitRepository) {}

  execute(input: { debtorId: string; amount: number; currency: CurrencyCode }) {
    return this.splitRepository.recordReceivedPayment(input);
  }
}
