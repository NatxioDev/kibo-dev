"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { voidSharedExpenseAction } from "@/features/splits/actions/split.action";

export function VoidExpenseButton({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await voidSharedExpenseAction(expenseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push("/friends");
      router.refresh();
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Eliminar gasto compartido
      </Button>
      <ConfirmDialog
        open={open}
        title="¿Eliminar este gasto compartido?"
        description="Se anula para todos y sale de los movimientos. El historial de la deuda se conserva. Si ya hubo un pago confirmado, no se puede eliminar."
        confirmLabel="Eliminar gasto"
        pendingLabel="Eliminando…"
        loading={pending}
        error={error}
        onConfirm={confirm}
        onClose={() => {
          if (!pending) {
            setError(null);
            setOpen(false);
          }
        }}
      />
    </>
  );
}
