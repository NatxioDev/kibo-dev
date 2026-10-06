import { KiboMascot } from "@/components/mascot/KiboMascot";
import type { MascotMood } from "@/components/mascot/types";

type DashboardHeaderProps = {
  displayName?: string | null;
  /** `null` cuando el estado vacío o de error ya muestra su propia mascota. */
  mood?: MascotMood | null;
};

export function DashboardHeader({ displayName, mood }: DashboardHeaderProps) {
  const firstName = displayName?.trim().split(/\s+/)[0];

  return (
    <div className="flex items-end gap-4">
      {mood ? <KiboMascot mood={mood} size={56} className="mb-1 shrink-0" /> : null}
      <div>
        <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {firstName ? `Hola, ${firstName} 👋` : "Hola 👋"}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-[0.95] font-extrabold tracking-[-0.045em] text-foreground sm:text-5xl">
          Tu resumen financiero
        </h1>
      </div>
    </div>
  );
}
