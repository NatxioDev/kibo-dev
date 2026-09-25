import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { AuthResult, LoginCredentials } from "@/types/auth";

export class SignIn {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<AuthResult> {
    return this.authRepository.signIn(credentials);
  }
}
