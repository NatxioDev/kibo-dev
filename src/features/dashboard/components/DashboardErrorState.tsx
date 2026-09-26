import { Button } from "@/components/ui/Button";

export function DashboardErrorState() {
  return (
    <div className="rounded-card border border-expense-border bg-expense-soft px-6 py-8 text-center">
      <p className="text-base font-medium text-expense-strong">
        No pudimos cargar tu resumen.
      </p>
      <p className="mt-1 text-sm text-expense/80">Intenta nuevamente.</p>
      <Button href="/" variant="secondary" className="mt-5">
        Reintentar
      </Button>
    </div>
  );
}
