"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KiboLogo } from "@/components/ui/KiboLogo";
import { useEffect, useState } from "react";
import { useWhatsNew } from "@/features/changelog/hooks/useWhatsNew";
import { FriendsLink } from "@/features/friends/components/FriendsLink";
import { usePendingFriendRequests } from "@/features/friends/hooks/usePendingFriendRequests";
import { getCurrentProfileAction } from "@/features/profile/actions/getCurrentProfile.action";
import type { CurrentProfile } from "@/features/profile/domain/models/Profile";
import { ProfileLink } from "@/features/settings/components/ProfileLink";

const HIDDEN_PREFIXES = ["/login", "/auth", "/onboarding", "/settings", "/privacy"];

export function AppTopBar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const pendingFriendRequests = usePendingFriendRequests(!hidden, pathname);
  const { hasUnseen } = useWhatsNew();

  useEffect(() => {
    if (hidden || profile) return;

    let cancelled = false;
    getCurrentProfileAction().then((result) => {
      if (!cancelled && result.success) {
        setProfile(result.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hidden, profile]);

  if (hidden) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="glass glass-lens mx-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-full border border-border bg-surface pr-2 pl-3 shadow-card">
        <Link href="/" className="inline-flex items-center text-foreground">
          <KiboLogo className="h-7" />
        </Link>
        <div className="flex items-center gap-2">
          <FriendsLink
            active={pathname.startsWith("/friends")}
            pendingCount={pendingFriendRequests}
          />
          <ProfileLink
            avatarUrl={profile?.avatar_url}
            name={profile?.display_name}
            showDot={hasUnseen}
          />
        </div>
      </div>
    </div>
  );
}
