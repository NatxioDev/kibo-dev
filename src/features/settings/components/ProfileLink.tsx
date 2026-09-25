import Link from "next/link";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";

type ProfileLinkProps = {
  avatarUrl?: string | null;
  name?: string | null;
  className?: string;
};

export function ProfileLink({
  avatarUrl = null,
  name = null,
  className = "",
}: ProfileLinkProps) {
  return (
    <Link
      href="/settings"
      aria-label="Perfil"
      className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-4xl border border-zinc-300 bg-white text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 ${className}`}
    >
      {avatarUrl ? (
        <ProfileAvatar avatarUrl={avatarUrl} name={name} size={40} />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
        </svg>
      )}
    </Link>
  );
}
