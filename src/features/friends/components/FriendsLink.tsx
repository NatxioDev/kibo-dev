import Link from "next/link";

type FriendsLinkProps = {
  active?: boolean;
  pendingCount?: number;
};

export function FriendsLink({ active = false, pendingCount = 0 }: FriendsLinkProps) {
  const showBadge = pendingCount > 0 && !active;
  const label = showBadge
    ? `Amigos, ${pendingCount} ${pendingCount === 1 ? "solicitud pendiente" : "solicitudes pendientes"}`
    : "Amigos";

  return (
    <Link
      href="/friends"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-card transition-colors ${
        active
          ? "border-primary/40 bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:bg-surface-muted"
      }`}
    >
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
        <circle cx="9" cy="8" r="3.25" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M15.5 4.9a3.25 3.25 0 0 1 0 6.2" />
        <path d="M17 13.8a5.5 5.5 0 0 1 3.5 5.2" />
      </svg>
      {showBadge ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-expense px-1 text-[0.6875rem] leading-none font-bold text-white tabular-nums ring-2 ring-background"
        >
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      ) : null}
    </Link>
  );
}
