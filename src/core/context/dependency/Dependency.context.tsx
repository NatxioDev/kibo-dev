"use client";

import { createContext } from "react";
import type { ClientDependencies } from "@/core/infrastructure/factories/Dependency.factory";

export const DependencyContext = createContext<ClientDependencies | null>(null);
