import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { AuthResult } from "@/types/auth";

export class SignOut {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<AuthResult> {
    return this.authRepository.signOut();
  }
}
