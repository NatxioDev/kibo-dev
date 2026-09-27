import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de navegador. Passkeys (WebAuthn) están nativos de `@supabase/supabase-js`
 * y están habilitados por defecto; el flag `auth.experimental.passkey` quedó
 * deprecado y no tiene efecto.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
