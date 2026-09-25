import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import type { AuthResult, RegisterCredentials } from "@/types/auth";

export class SignUp {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(
    credentials: Omit<RegisterCredentials, "confirmPassword">,
  ): Promise<AuthResult> {
    return this.authRepository.signUp(credentials);
  }
}
