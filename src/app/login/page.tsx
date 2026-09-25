import Link from "next/link";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "No pudimos iniciar sesión con Google. Inténtalo de nuevo.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const errorKey = typeof error === "string" ? error : null;
  const initialError = errorKey ? (ERROR_MESSAGES[errorKey] ?? null) : null;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-stretch gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Kibo
          </h1>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Tu gestor personal de gastos
          </p>
        </div>
        <GoogleSignInButton initialError={initialError} />
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Al continuar aceptas nuestra{" "}
          <Link href="/privacy" className="underline">
            política de privacidad
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
