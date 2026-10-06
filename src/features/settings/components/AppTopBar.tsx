"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KiboLogo } from "@/components/ui/KiboLogo";
import { useWhatsNew } from "@/features/changelog/hooks/useWhatsNew";
import { FriendsLink } from "@/features/friends/components/FriendsLink";
import { useFriendAlerts } from "@/features/friends/hooks/usePendingFriendRequests";
import type { CurrentProfile } from "@/features/profile/domain/models/Profile";
import { ReportsLink } from "@/features/reports/components/ReportsLink";
import { ProfileLink } from "@/features/settings/components/ProfileLink";

const HIDDEN_PREFIXES = ["/login", "/auth", "/onboarding", "/settings", "/privacy"];

type AppTopBarProps = {
  profile: CurrentProfile | null;
};

export function AppTopBar({ profile }: AppTopBarProps) {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const friendAlerts = useFriendAlerts(!hidden, pathname);
  const { hasUnseen } = useWhatsNew();

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
          <ReportsLink active={pathname.startsWith("/reportes")} />
          <FriendsLink
            active={pathname.startsWith("/friends")}
            requests={friendAlerts.requests}
            unclassified={friendAlerts.unclassified}
            disputes={friendAlerts.disputes}
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
