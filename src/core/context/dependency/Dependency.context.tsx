"use client";

import { createContext } from "react";
import type { AppDependencies } from "@/core/infrastructure/factories/Dependency.factory";

export const DependencyContext = createContext<AppDependencies | null>(null);
