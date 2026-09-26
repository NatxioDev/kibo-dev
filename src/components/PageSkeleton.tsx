type PageSkeletonProps = {
  rows?: number;
  withToolbar?: boolean;
};

export function PageSkeleton({ rows = 5, withToolbar = false }: PageSkeletonProps) {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando…"
      className="flex min-h-full flex-1 flex-col px-4 pt-8 pb-16"
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-7">
        <div className="flex flex-col gap-4">
          <div className="h-6 w-24 animate-pulse rounded-control bg-surface-muted" />
          <div className="h-10 w-56 animate-pulse rounded-2xl bg-surface-muted" />
        </div>
        {withToolbar ? (
          <div className="h-11 animate-pulse rounded-control bg-surface-muted" />
        ) : null}
        <div className="flex flex-col gap-2">
          <div className="ml-4 h-3 w-16 animate-pulse rounded bg-surface-muted" />
          <div className="flex flex-col divide-y divide-track rounded-card bg-surface-muted/60">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-muted" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3.5 w-2/5 animate-pulse rounded bg-surface-muted" />
                  <div className="h-3 w-3/5 animate-pulse rounded bg-surface-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
