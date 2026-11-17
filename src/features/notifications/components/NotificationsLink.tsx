import Link from "next/link";

type NotificationsLinkProps = {
  active?: boolean;
  unread?: number;
};

export function NotificationsLink({
  active = false,
  unread = 0,
}: NotificationsLinkProps) {
  const showBadge = unread > 0 && !active;
  const label = showBadge
    ? `Notificaciones, ${unread} sin leer`
    : "Notificaciones";

  return (
    <Link
      href="/notifications"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-card transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {showBadge ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-expense px-1 text-[0.6875rem] leading-none font-bold text-white tabular-nums ring-2 ring-background"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
