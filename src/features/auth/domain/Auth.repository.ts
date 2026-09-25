import type {
  AuthResult,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";

export interface AuthRepository {
  signIn(credentials: LoginCredentials): Promise<AuthResult>;
  signUp(
    credentials: Omit<RegisterCredentials, "confirmPassword">,
  ): Promise<AuthResult>;
  signOut(): Promise<AuthResult>;
}
