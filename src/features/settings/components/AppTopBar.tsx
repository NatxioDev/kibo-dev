"use client";

import { usePathname } from "next/navigation";
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
    <div className="sticky top-0 z-40 border-b border-zinc-200 bg-background/90 backdrop-blur dark:border-zinc-800">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-end px-4">
        <ProfileLink
          avatarUrl={profile?.avatar_url}
          name={profile?.display_name}
        />
      </div>
    </div>
  );
}
