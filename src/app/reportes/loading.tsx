export default function ReportesLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando reportes…"
      className="flex min-h-full flex-1 flex-col px-4 pt-6 pb-16 sm:pt-10"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-44 animate-pulse rounded-2xl bg-surface-muted" />
          <div className="h-9 w-32 animate-pulse rounded-control bg-surface-muted" />
        </div>
        <div className="h-11 animate-pulse rounded-control bg-surface-muted" />
        <div className="mx-auto h-10 w-40 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="flex flex-col gap-2 px-1">
          <div className="h-3 w-36 animate-pulse rounded bg-surface-muted" />
          <div className="h-11 w-44 animate-pulse rounded-2xl bg-surface-muted" />
        </div>
        <div className="h-12 animate-pulse rounded-control bg-surface-muted sm:max-w-sm" />
        <div className="grid grid-cols-3 gap-2 sm:max-w-xl">
          <div className="h-17 animate-pulse rounded-card bg-surface-muted" />
          <div className="h-17 animate-pulse rounded-card bg-surface-muted" />
          <div className="h-17 animate-pulse rounded-card bg-surface-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-72 animate-pulse rounded-card bg-surface-muted" />
          <div className="h-72 animate-pulse rounded-card bg-surface-muted" />
        </div>
      </div>
    </main>
  );
}
