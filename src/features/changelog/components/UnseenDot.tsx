"use client";

import { useWhatsNew } from "@/features/changelog/hooks/useWhatsNew";

export function UnseenDot() {
  const { hasUnseen } = useWhatsNew();
  if (!hasUnseen) return null;

  return (
    <span role="status" aria-label="Hay novedades sin ver" className="flex h-2.5 w-2.5 rounded-full bg-expense" />
  );
}
