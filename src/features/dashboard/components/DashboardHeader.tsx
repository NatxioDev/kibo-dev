type DashboardHeaderProps = {
  displayName?: string | null;
};

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const firstName = displayName?.trim().split(/\s+/)[0];

  return (
    <div>
      <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {firstName ? `Hola, ${firstName} 👋` : "Hola 👋"}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-[0.95] font-extrabold tracking-[-0.045em] text-foreground sm:text-5xl">
        Tu resumen financiero
      </h1>
    </div>
  );
}
