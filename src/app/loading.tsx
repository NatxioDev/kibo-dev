export default function DashboardLoading() {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-16 animate-pulse rounded bg-zinc-800" />
          <div className="h-8 w-56 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-11 animate-pulse rounded-lg bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-24 animate-pulse rounded-xl bg-zinc-800" />
          <div className="h-24 animate-pulse rounded-xl bg-zinc-800" />
          <div className="h-24 animate-pulse rounded-xl bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl bg-zinc-800" />
          <div className="h-48 animate-pulse rounded-xl bg-zinc-800" />
        </div>
      </div>
    </main>
  );
}
