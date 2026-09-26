import { Card } from "@/components/ui/Card";
import type { Release } from "@/features/changelog/types";

const dateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const SECTIONS = [
  { key: "new", label: "Nuevo", dotClass: "bg-primary" },
  { key: "improvements", label: "Mejoras", dotClass: "bg-income" },
  { key: "fixes", label: "Correcciones", dotClass: "bg-expense" },
] as const;

export function formatReleaseDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function ReleaseSections({ release }: { release: Release }) {
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map(({ key, label, dotClass }) => {
        const items = release[key];
        if (!items?.length) return null;
        return (
          <section key={key} className="flex flex-col gap-2">
            <h3 className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {label}
            </h3>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[0.9375rem] text-pretty text-foreground">
                  <span aria-hidden className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

type ReleaseCardProps = {
  release: Release;
  current?: boolean;
};

export function ReleaseCard({ release, current = false }: ReleaseCardProps) {
  return (
    <Card as="article" className="flex flex-col gap-4 p-5">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-foreground tabular-nums">
            v{release.version}
          </h2>
          {current ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              Actual
            </span>
          ) : null}
        </div>
        <time dateTime={release.date} className="text-sm text-muted-foreground">
          {formatReleaseDate(release.date)}
        </time>
      </header>
      {release.title ? (
        <p className="-mt-2 text-[0.9375rem] font-semibold text-foreground">{release.title}</p>
      ) : null}
      <ReleaseSections release={release} />
    </Card>
  );
}
