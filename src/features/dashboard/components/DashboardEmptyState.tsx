import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DashboardEmptyState() {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <span
        aria-hidden
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-2xl"
      >
        🌱
      </span>
      <p className="mt-4 text-base font-medium text-foreground">
        Aún no tienes movimientos este período.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Registra tu primer ingreso o gasto para comenzar.
      </p>
      <Button href="/transactions/new" className="mt-6">
        + Registrar transacción
      </Button>
    </Card>
  );
}
