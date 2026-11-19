import Link from "next/link";
import type { ReactNode } from "react";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";

export function friendName(profile: FriendProfile): string {
  return profile.display_name ?? (profile.username ? `@${profile.username}` : "Usuario");
}

type FriendRowProps = {
  profile: FriendProfile;
  trailing?: ReactNode;
  /** Acciones propias de la fila: van debajo, para no apretar el nombre en mobile. */
  actions?: ReactNode;
  error?: string | null;
  subtitle?: ReactNode;
  href?: string;
};

export function FriendRow({ profile, trailing, actions, error, subtitle, href }: FriendRowProps) {
  const name = friendName(profile);
  const identity = (
    <>
      <span className="block truncate text-[0.9375rem] font-semibold text-foreground">{name}</span>
      {profile.username && profile.display_name ? (
        <span translate="no" className="mt-0.5 block truncate text-sm text-muted-foreground">
          @{profile.username}
        </span>
      ) : null}
      {subtitle ? (
        <span className="mt-0.5 block truncate text-sm tabular-nums text-muted-foreground">
          {subtitle}
        </span>
      ) : null}
    </>
  );

  const row = (
    <>
      <span aria-hidden className="shrink-0">
        <ProfileAvatar avatarUrl={profile.avatar_url} name={name} size={40} />
      </span>
      <span className="min-w-0 flex-1">{identity}</span>
      {trailing ? <span className="flex shrink-0 items-center gap-2">{trailing}</span> : null}
      {href ? <RowChevron /> : null}
    </>
  );

  const rowClass = "flex min-h-11 items-center gap-3 px-4 py-3";

  return (
    <li className="flex flex-col">
      {href ? (
        <Link
          href={href}
          className={`${rowClass} hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary/50 active:bg-surface-muted`}
        >
          {row}
        </Link>
      ) : (
        <div className={rowClass}>{row}</div>
      )}
      {actions ? <div className="flex flex-wrap gap-2 px-4 pb-3">{actions}</div> : null}
      {error ? (
        <p className="px-4 pb-3 text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function RowChevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-muted-foreground/60"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function FriendRowBadge({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-semibold text-muted-foreground">{children}</span>
  );
}
