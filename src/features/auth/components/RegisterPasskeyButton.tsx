"use client";

import { Button } from "@/components/ui/Button";

type RegisterPasskeyButtonProps = {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function RegisterPasskeyButton({
  onClick,
  loading = false,
  disabled = false,
}: RegisterPasskeyButtonProps) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? "Registrando…" : "Agregar Passkey"}
    </Button>
  );
}
