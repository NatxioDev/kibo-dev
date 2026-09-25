type DashboardHeaderProps = {
  periodLabel: string;
  displayName?: string | null;
};

export function DashboardHeader({
  periodLabel,
  displayName,
}: DashboardHeaderProps) {
  const firstName = displayName?.trim().split(/\s+/)[0];

  return (
    <div>
      <p className="text-base text-zinc-500 dark:text-zinc-400">
        {firstName ? `Hola, ${firstName}` : "Hola"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Tu resumen financiero
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{periodLabel}</p>
    </div>
  );
}
