import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { PasskeyCredential } from "@/features/auth/domain/Passkey";
import type { AuthResult } from "@/types/auth";

export interface AuthRepository {
  signInWithGoogle(redirectTo: string): Promise<AuthResult>;
  signInWithPasskey(): Promise<AuthResult>;
  registerPasskey(friendlyName?: string): Promise<AuthResult>;
  listPasskeys(): Promise<ServiceResult<PasskeyCredential[]>>;
  updatePasskey(id: string, friendlyName: string): Promise<AuthResult>;
  deletePasskey(id: string): Promise<AuthResult>;
  signOut(): Promise<AuthResult>;
}
