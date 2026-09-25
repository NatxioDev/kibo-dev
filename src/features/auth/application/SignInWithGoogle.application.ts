import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { AuthResult } from "@/types/auth";

export class SignInWithGoogle {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(redirectTo: string): Promise<AuthResult> {
    return this.authRepository.signInWithGoogle(redirectTo);
  }
}
