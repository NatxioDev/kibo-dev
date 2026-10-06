import type { ReactNode } from "react";
import { KiboMascot } from "@/components/mascot/KiboMascot";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  /** Sin `icon` se muestra Kibo durmiendo. */
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {icon ? (
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-3xl bg-surface-muted text-2xl"
        >
          {icon}
        </span>
      ) : (
        <KiboMascot mood="durmiendo" size={56} className="mb-3" />
      )}
      <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-balance text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="max-w-xs text-sm text-pretty text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </Card>
  );
}
