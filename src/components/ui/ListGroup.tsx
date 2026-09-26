import Link from "next/link";
import type { ReactNode } from "react";

type ListGroupProps = {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ListGroup({ title, footer, children, className = "" }: ListGroupProps) {
  return (
    <section className={`flex flex-col gap-2 ${className}`}>
      {title ? (
        <h2 className="px-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {title}
        </h2>
      ) : null}
      <ul className="glass divide-y divide-track overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {children}
      </ul>
      {footer ? (
        <div className="px-4 text-sm text-pretty text-muted-foreground">{footer}</div>
      ) : null}
    </section>
  );
}

type ListRowProps = {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  tone?: "default" | "danger";
  muted?: boolean;
};

export function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  href,
  onClick,
  chevron = Boolean(href),
  tone = "default",
  muted = false,
}: ListRowProps) {
  const content = (
    <>
      {icon ? (
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-lg"
        >
          {icon}
        </span>
      ) : null}
      <span className={`min-w-0 flex-1 ${muted ? "opacity-55" : ""}`}>
        <span
          className={`block truncate text-[0.9375rem] font-semibold ${
            tone === "danger" ? "text-expense" : "text-foreground"
          }`}
        >
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
      {chevron ? (
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
      ) : null}
    </>
  );

  const rowClass =
    "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors";
  const interactiveClass = `${rowClass} hover:bg-surface-muted active:bg-surface-muted`;

  if (href) {
    return (
      <li>
        <Link href={href} className={interactiveClass}>
          {content}
        </Link>
      </li>
    );
  }
  if (onClick) {
    return (
      <li>
        <button type="button" onClick={onClick} className={interactiveClass}>
          {content}
        </button>
      </li>
    );
  }
  return <li className={rowClass}>{content}</li>;
}
