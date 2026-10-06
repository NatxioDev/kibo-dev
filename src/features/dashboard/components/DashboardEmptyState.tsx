import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { KiboMascot } from "@/components/mascot/KiboMascot";

export function DashboardEmptyState() {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <KiboMascot mood="durmiendo" size={64} />
      <p className="mt-6 text-base font-medium text-foreground">
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
