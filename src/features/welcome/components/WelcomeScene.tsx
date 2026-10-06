import type { ReactNode } from "react";
import type { MascotMood } from "@/components/mascot/types";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { WelcomeMascotProvider } from "@/features/welcome/welcomeMascot";
import { FloatingEmojiField } from "./FloatingEmojiField";
import { WelcomeHero } from "./WelcomeHero";

type WelcomeSceneProps = {
  /** Call to action (e.g. auth controls). The scene knows nothing about auth. */
  children: ReactNode;
  footer?: ReactNode;
  initialMascotMood?: MascotMood;
};

export function WelcomeScene({ children, footer, initialMascotMood }: WelcomeSceneProps) {
  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 pt-[max(6.5rem,env(safe-area-inset-top))] pb-[max(4rem,env(safe-area-inset-bottom))] lg:py-16">
      <WelcomeMascotProvider initialMood={initialMascotMood}>
        <Stagger
          stagger={0.12}
          className="pointer-events-none relative z-10 flex w-full max-w-sm flex-col items-stretch gap-6 *:pointer-events-auto"
        >
          <WelcomeHero />
          <Reveal spring="bouncy">{children}</Reveal>
          {footer ? <Reveal>{footer}</Reveal> : null}
        </Stagger>
      </WelcomeMascotProvider>
      <FloatingEmojiField />
    </main>
  );
}
