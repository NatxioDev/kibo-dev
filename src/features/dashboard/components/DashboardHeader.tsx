type DashboardHeaderProps = {
  periodLabel: string;
};

export function DashboardHeader({ periodLabel }: DashboardHeaderProps) {
  return (
    <div>
      <p className="text-base text-zinc-500 dark:text-zinc-400">Hola</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Tu resumen financiero
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{periodLabel}</p>
    </div>
  );
}
