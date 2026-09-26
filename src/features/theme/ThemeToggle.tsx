"use client";

import { Switch } from "@/components/ui/Switch";
import { useTheme } from "@/features/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Switch checked={theme === "dark"} onChange={toggleTheme} label="Modo oscuro" />
  );
}
