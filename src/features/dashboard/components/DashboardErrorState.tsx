import { KiboMascot } from "@/components/mascot/KiboMascot";
import { Button } from "@/components/ui/Button";

export function DashboardErrorState() {
  return (
    <div className="flex flex-col items-center rounded-card border border-expense-border bg-expense-soft px-6 py-8 text-center">
      <KiboMascot mood="mareado" size={56} />
      <p className="mt-6 text-base font-medium text-expense-strong">
        No pudimos cargar tu resumen.
      </p>
      <p className="mt-1 text-sm text-expense/80">Intenta nuevamente.</p>
      <Button href="/" variant="secondary" className="mt-5">
        Reintentar
      </Button>
    </div>
  );
}
