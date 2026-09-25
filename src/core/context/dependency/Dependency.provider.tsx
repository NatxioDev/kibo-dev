"use client";

import { useMemo, type ReactNode } from "react";
import { DependencyContext } from "@/core/context/dependency/Dependency.context";
import { DependencyFactory } from "@/core/infrastructure/factories/Dependency.factory";
import { createClient } from "@/lib/supabase/client";

type DependencyProviderProps = {
  children: ReactNode;
};

export function DependencyProvider({ children }: DependencyProviderProps) {
  const dependencies = useMemo(
    () => DependencyFactory.createFromSupabase(createClient()),
    [],
  );

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}
