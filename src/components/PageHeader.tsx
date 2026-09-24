import Link from "next/link";
import type { ReactNode } from "react";
import { BackButton } from "@/components/BackButton";

type BreadcrumbItem = {
  href: string;
  label: string;
};

type PageHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  fallbackHref?: string;
  actions?: ReactNode;
};

export function PageHeader({
  breadcrumbs,
  title,
  description,
  fallbackHref = "/",
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BackButton fallbackHref={fallbackHref} />
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400"
        >
          {breadcrumbs.map((item, index) => (
            <span key={`${item.href}-${item.label}`} className="flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden>/</span> : null}
              <Link href={item.href} className="underline underline-offset-2">
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-col gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
