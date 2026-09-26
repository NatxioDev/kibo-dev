import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { CurrentProfile } from "@/features/profile/domain/models/Profile";

type ProfileHeaderProps = {
  profile: CurrentProfile;
  href?: string;
};

export function ProfileHeader({ profile, href }: ProfileHeaderProps) {
  const name = profile.display_name ?? profile.email ?? "Usuario";

  const content = (
    <>
      <ProfileAvatar
        avatarUrl={profile.avatar_url}
        name={name}
        size={64}
        className="shrink-0 ring-2 ring-border"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-display text-xl font-extrabold tracking-[-0.03em] text-foreground">
          {name}
        </span>
        {profile.username ? (
          <span className="truncate text-sm font-semibold text-primary">
            @{profile.username}
          </span>
        ) : null}
        {profile.email ? (
          <span className="truncate text-sm text-muted-foreground">
            {profile.email}
          </span>
        ) : null}
      </span>
      {href ? (
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-muted-foreground">
          Editar
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      ) : null}
    </>
  );

  const className = "flex items-center gap-4 px-5 py-5";

  if (href) {
    return (
      <Card
        as={Link}
        href={href}
        className={`${className} transition-colors hover:bg-surface-muted`}
      >
        {content}
      </Card>
    );
  }

  return (
    <Card as="section" aria-label="Tu perfil" className={className}>
      {content}
    </Card>
  );
}
