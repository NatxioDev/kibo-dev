"use client";

import { KiboLogo } from "@/components/ui/KiboLogo";
import { useWelcomeMascotMood } from "@/features/welcome/welcomeMascot";

export function WelcomeLogo({ className }: { className?: string }) {
  return <KiboLogo mood={useWelcomeMascotMood()} className={className} />;
}
