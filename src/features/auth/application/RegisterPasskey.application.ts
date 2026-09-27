import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { AuthResult } from "@/types/auth";

export class RegisterPasskey {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(friendlyName?: string): Promise<AuthResult> {
    return this.authRepository.registerPasskey(friendlyName);
  }
}
