import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { AuthResult } from "@/types/auth";

export class UpdatePasskey {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(id: string, friendlyName: string): Promise<AuthResult> {
    return this.authRepository.updatePasskey(id, friendlyName);
  }
}
