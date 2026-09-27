"use client";

import { Button } from "@/components/ui/Button";
import { usePasskeySignIn } from "@/features/auth/hooks/usePasskeySignIn";

function PasskeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none">
      <path
        d="M12.5 10.5a3.5 3.5 0 1 0-3.4 3.49L7 16v2h2v2h2v-2.1l1.1-1.1c.45.13.93.2 1.4.2a3.5 3.5 0 0 0 0-7Zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
        className="fill-current"
      />
      <path
        d="M19 8.5A7.5 7.5 0 0 0 7.2 4.8"
        className="stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M5 15.5A7.5 7.5 0 0 0 16.8 19.2"
        className="stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PasskeySignInButton() {
  const { signIn, error, loading } = usePasskeySignIn();

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        variant="secondary"
        size="lg"
        onClick={signIn}
        disabled={loading}
        className="w-full gap-3"
      >
        <PasskeyIcon />
        <span className="inline-flex items-center gap-2">
          {loading ? "Esperando Passkey…" : "Continuar con Passkey"}
          <span className="text-[0.625rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            Beta
          </span>
        </span>
      </Button>
      {error ? (
        <p className="text-center text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
