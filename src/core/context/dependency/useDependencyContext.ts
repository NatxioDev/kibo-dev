"use client";

import { useContext } from "react";
import { DependencyContext } from "@/core/context/dependency/Dependency.context";
import type { AppDependencies } from "@/core/infrastructure/factories/Dependency.factory";

export function useDependencyContext(): AppDependencies {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error(
      "useDependencyContext debe usarse dentro de DependencyProvider.",
    );
  }
  return context;
}
