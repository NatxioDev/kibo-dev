import Link from "next/link";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { CurrentProfile } from "@/features/profile/domain/models/Profile";

type ProfileHeaderProps = {
  profile: CurrentProfile;
  href?: string;
};

const cardClassName =
  "flex items-center gap-4 rounded-xl border border-zinc-300 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900";

export function ProfileHeader({ profile, href }: ProfileHeaderProps) {
  const name = profile.display_name ?? profile.email ?? "Usuario";

  const content = (
    <>
      <ProfileAvatar avatarUrl={profile.avatar_url} name={name} size={56} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {name}
        </p>
        {profile.username ? (
          <p className="truncate text-sm font-medium text-zinc-600 dark:text-zinc-300">
            @{profile.username}
          </p>
        ) : null}
        {profile.email ? (
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {profile.email}
          </p>
        ) : null}
      </div>
      {href ? (
        <span className="text-zinc-500 dark:text-zinc-400" aria-hidden>
          →
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="Editar perfil"
        className={`${cardClassName} transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800`}
      >
        {content}
      </Link>
    );
  }

  return <section className={cardClassName}>{content}</section>;
}
