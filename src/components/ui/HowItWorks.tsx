"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function HowItWorks({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="ghost"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="w-fit px-0"
      >
        ¿Cómo funciona?
      </Button>
      {open ? (
        <div className="flex flex-col gap-2 pb-1 text-sm text-pretty text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}
