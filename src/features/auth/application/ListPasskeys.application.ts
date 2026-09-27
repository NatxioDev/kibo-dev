import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { PasskeyCredential } from "@/features/auth/domain/Passkey";

export class ListPasskeys {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<ServiceResult<PasskeyCredential[]>> {
    return this.authRepository.listPasskeys();
  }
}
