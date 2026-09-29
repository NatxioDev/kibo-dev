import { Reveal } from "@/components/motion/Reveal";
import { KiboLogo } from "@/components/ui/KiboLogo";

/** Must be rendered inside `Stagger`: each line enters in sequence. */
export function WelcomeHero() {
  return (
    <>
      <Reveal className="flex justify-center text-hero-foreground">
        <KiboLogo className="h-20 w-auto sm:h-28" />
      </Reveal>
      <Reveal className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-hero-foreground sm:text-4xl">
          Tu plata, bajo control.
        </h1>
        <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-hero-muted uppercase">
          Registra. Entiende. Decide.
        </p>
      </Reveal>
      <Reveal>
        <p className="mx-auto max-w-xs text-center text-sm text-muted-foreground">
          Anota tus gastos, mira en qué se va tu plata y divide cuentas con tus
          amigos, en Bolivianos o dólares.
        </p>
      </Reveal>
    </>
  );
}
