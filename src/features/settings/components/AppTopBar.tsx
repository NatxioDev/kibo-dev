"use client";

import { usePathname } from "next/navigation";
import { SettingsGearLink } from "@/features/settings/components/SettingsGearLink";

export function AppTopBar() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/settings")
  ) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200 bg-background/90 backdrop-blur dark:border-zinc-800">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-end px-4">
        <SettingsGearLink />
      </div>
    </div>
  );
}
