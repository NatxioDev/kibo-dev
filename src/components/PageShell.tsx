import type { ReactNode } from "react";
import { Stagger } from "@/components/motion/Stagger";

type PageShellProps = {
  children: ReactNode;
  width?: "md" | "lg";
};

export function PageShell({ children, width = "md" }: PageShellProps) {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 pt-8 pb-[max(4rem,env(safe-area-inset-bottom))]">
      <Stagger
        className={`mx-auto flex w-full flex-col gap-7 ${
          width === "lg" ? "max-w-2xl" : "max-w-md"
        }`}
      >
        {children}
      </Stagger>
    </main>
  );
}
