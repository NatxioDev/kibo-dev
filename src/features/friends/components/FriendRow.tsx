import type { ReactNode } from "react";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";

export function friendName(profile: FriendProfile): string {
  return profile.display_name ?? (profile.username ? `@${profile.username}` : "Usuario");
}

type FriendRowProps = {
  profile: FriendProfile;
  trailing?: ReactNode;
  error?: string | null;
};

export function FriendRow({ profile, trailing, error }: FriendRowProps) {
  const name = friendName(profile);

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex min-h-10 items-center gap-3">
        <span aria-hidden className="shrink-0">
          <ProfileAvatar avatarUrl={profile.avatar_url} name={name} size={40} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-semibold text-foreground">
            {name}
          </span>
          {profile.username && profile.display_name ? (
            <span
              translate="no"
              className="mt-0.5 block truncate text-sm text-muted-foreground"
            >
              @{profile.username}
            </span>
          ) : null}
        </span>
        {trailing ? (
          <span className="flex shrink-0 items-center gap-2">{trailing}</span>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function FriendRowBadge({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-semibold text-muted-foreground">{children}</span>
  );
}
