import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Card } from "@/components/ui/Card";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "No pudimos iniciar sesión con Google. Inténtalo de nuevo.",
};

const HIGHLIGHTS = [
  { icon: "📊", text: "Tu balance del mes de un vistazo" },
  { icon: "🏷️", text: "Gastos organizados por categoría" },
  { icon: "💱", text: "Bolivianos y dólares" },
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const errorKey = typeof error === "string" ? error : null;
  const initialError = errorKey ? (ERROR_MESSAGES[errorKey] ?? null) : null;

  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <Stagger
        stagger={0.12}
        className="relative flex w-full max-w-sm flex-col items-stretch gap-8"
      >
        <Reveal className="flex flex-col items-center gap-1 text-hero-foreground">
          <h1 className="text-center font-display text-[7rem] leading-[0.85] font-extrabold tracking-[-0.07em] sm:text-[9rem]">
            Kibo
          </h1>
          <p className="text-center text-[0.6875rem] font-semibold tracking-[0.22em] text-hero-muted uppercase">
            Tu gestor personal de gastos
          </p>
        </Reveal>

        <Reveal spring="bouncy">
          <Card className="glass-lens flex flex-col gap-6 px-6 py-7">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.04em] text-foreground">
                Bienvenido 👋
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Inicia sesión para ver tu resumen financiero.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-3 text-sm text-foreground"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted"
                  >
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>

            <GoogleSignInButton initialError={initialError} />
          </Card>
        </Reveal>

        <Reveal>
          <p className="text-center text-xs text-muted-foreground">
            Al continuar aceptas nuestra{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              política de privacidad
            </Link>
            .
          </p>
        </Reveal>
      </Stagger>
    </main>
  );
}
