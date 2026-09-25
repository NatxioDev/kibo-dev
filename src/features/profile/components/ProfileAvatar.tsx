import Image from "next/image";

type ProfileAvatarProps = {
  avatarUrl: string | null;
  name: string | null;
  size?: number;
  className?: string;
};

function getInitial(name: string | null): string {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

export function ProfileAvatar({
  avatarUrl,
  name,
  size = 40,
  className = "",
}: ProfileAvatarProps) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name ?? "Avatar"}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={`inline-flex items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 ${className}`}
    >
      {getInitial(name)}
    </span>
  );
}
