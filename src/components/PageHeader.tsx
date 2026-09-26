import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  back?: { href: string; label: string };
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  back,
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      {back ? (
        <Link
          href={back.href}
          className="-ml-2 inline-flex h-9 w-fit items-center gap-0.5 rounded-control pr-3 pl-1 text-[0.9375rem] font-semibold text-primary transition-colors hover:bg-surface-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {back.label}
        </Link>
      ) : null}

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-[0.9375rem] text-pretty text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
