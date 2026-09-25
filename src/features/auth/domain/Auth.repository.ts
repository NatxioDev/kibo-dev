import type { AuthResult } from "@/types/auth";

export interface AuthRepository {
  signInWithGoogle(redirectTo: string): Promise<AuthResult>;
  signOut(): Promise<AuthResult>;
}
