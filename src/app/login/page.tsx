import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { PasskeySignInButton } from "@/features/auth/components/PasskeySignInButton";
import { WelcomeScene } from "@/features/welcome/components/WelcomeScene";

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "No pudimos iniciar sesión con Google. Inténtalo de nuevo.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const errorKey = typeof error === "string" ? error : null;
  const initialError = errorKey ? (ERROR_MESSAGES[errorKey] ?? null) : null;

  return (
    <WelcomeScene
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Al continuar aceptas nuestra{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            política de privacidad
          </Link>
          .
        </p>
      }
    >
      <Card className="glass-lens flex flex-col gap-3 px-6 py-6">
        <GoogleSignInButton initialError={initialError} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden />
          o
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        <PasskeySignInButton />
      </Card>
    </WelcomeScene>
  );
}
