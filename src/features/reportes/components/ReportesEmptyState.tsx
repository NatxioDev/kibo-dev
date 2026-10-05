import { Card } from "@/components/ui/Card";

export function ReportesEmptyState() {
  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-3xl">
        📊
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-lg font-bold text-foreground">
          Todavía no hay datos para reportar
        </h3>
        <p className="text-sm text-muted-foreground">
          Registra ingresos y gastos en Bolivianos o Dólares para ver
          tendencias, balances y el desglose por categoría.
        </p>
      </div>
    </Card>
  );
}
