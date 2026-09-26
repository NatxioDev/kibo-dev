export default function DashboardLoading() {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 pt-10 pb-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
          <div className="h-8 w-60 animate-pulse rounded bg-surface-muted" />
        </div>

        <div className="h-11 animate-pulse rounded-control bg-surface-muted" />

        <div className="h-44 animate-pulse rounded-card bg-surface-muted" />

        <div className="grid grid-cols-2 gap-3">
          <div className="h-18 animate-pulse rounded-card bg-surface-muted" />
          <div className="h-18 animate-pulse rounded-card bg-surface-muted" />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-card bg-surface-muted" />
          <div className="h-56 animate-pulse rounded-card bg-surface-muted" />
        </div>
      </div>
    </main>
  );
}
