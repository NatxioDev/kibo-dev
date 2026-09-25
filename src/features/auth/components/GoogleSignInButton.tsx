"use client";

import { useGoogleSignIn } from "@/features/auth/hooks/useGoogleSignIn";

type GoogleSignInButtonProps = {
  initialError?: string | null;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ initialError }: GoogleSignInButtonProps) {
  const { signIn, error, loading } = useGoogleSignIn();
  const message = error ?? initialError ?? null;

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white text-base font-medium text-zinc-800 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <GoogleIcon />
        {loading ? "Redirigiendo…" : "Continuar con Google"}
      </button>
      {message ? (
        <p className="text-center text-sm text-expense" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
