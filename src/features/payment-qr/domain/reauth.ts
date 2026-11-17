import { PAYMENT_QR_REAUTH_WINDOW_MS } from "@/features/payment-qr/domain/constants";

/** True si el último inicio de sesión (no un refresh) entra en la ventana. */
export function isRecentSignIn(
  lastSignInAt: string | null | undefined,
  now: Date,
  windowMs: number = PAYMENT_QR_REAUTH_WINDOW_MS,
): boolean {
  if (!lastSignInAt) return false;
  const signedIn = new Date(lastSignInAt).getTime();
  if (Number.isNaN(signedIn)) return false;
  const age = now.getTime() - signedIn;
  return age >= 0 && age <= windowMs;
}
