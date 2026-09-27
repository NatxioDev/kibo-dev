import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { AuthResult } from "@/types/auth";

export class DeletePasskey {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(id: string): Promise<AuthResult> {
    return this.authRepository.deletePasskey(id);
  }
}
