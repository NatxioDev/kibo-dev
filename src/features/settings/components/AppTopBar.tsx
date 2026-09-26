"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KiboMark } from "@/components/ui/KiboMark";
import { useEffect, useState } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";
import type { CurrentProfile } from "@/features/profile/domain/models/Profile";
import { ProfileLink } from "@/features/settings/components/ProfileLink";

const HIDDEN_PREFIXES = ["/login", "/auth", "/onboarding", "/settings", "/privacy"];

export function AppTopBar() {
  const pathname = usePathname();
  const { profileRepository } = useDependencyContext();
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (hidden || profile) return;

    let cancelled = false;
    new GetCurrentProfile(profileRepository).execute().then((result) => {
      if (!cancelled && result.success) {
        setProfile(result.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hidden, profile, profileRepository]);

  if (hidden) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="glass glass-lens mx-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-full border border-border bg-surface pr-2 pl-3 shadow-card">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-[-0.04em] text-foreground"
        >
          <KiboMark className="h-7 w-7" />
          Kibo
        </Link>
        <ProfileLink
          avatarUrl={profile?.avatar_url}
          name={profile?.display_name}
        />
      </div>
    </div>
  );
}
