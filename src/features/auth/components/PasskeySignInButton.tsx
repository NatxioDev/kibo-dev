"use client";

import { Pressable } from "@/components/motion/Pressable";
import { Button } from "@/components/ui/Button";
import { usePasskeySignIn } from "@/features/auth/hooks/usePasskeySignIn";
import { AuthErrorMessage } from "./AuthErrorMessage";
import { RedirectOverlay } from "./RedirectOverlay";

function PasskeyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-foreground"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.661-1.009.661-1.591a6 6 0 1 1 11.681-1.801Z" />
    </svg>
  );
}

export function PasskeySignInButton() {
  const { signIn, error, loading, redirecting } = usePasskeySignIn();

  return (
    <div className="flex w-full flex-col">
      <Pressable>
        <Button
          variant="secondary"
          size="lg"
          onClick={signIn}
          loading={loading}
          className="w-full gap-3"
        >
          {loading ? null : <PasskeyIcon />}
          <span className="inline-flex items-center gap-2">
            {loading ? "Esperando Passkey…" : "Continuar con Passkey"}
            <span className="text-[0.625rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Beta
            </span>
          </span>
        </Button>
      </Pressable>
      <AuthErrorMessage message={error ?? null} />
      {redirecting ? <RedirectOverlay label="Entrando a Kibo…" /> : null}
    </div>
  );
}
