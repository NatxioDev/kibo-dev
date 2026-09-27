"use client";

import { useEffect } from "react";
import { useWhatsNew } from "@/features/changelog/hooks/useWhatsNew";

export function MarkReleasesSeen() {
  const { markSeen } = useWhatsNew();

  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return null;
}
