import type { ReactNode } from "react";

type ChoiceChipProps = {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ChoiceChip({
  selected,
  onSelect,
  disabled = false,
  icon,
  children,
  className = "",
}: ChoiceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border px-3 text-center text-xs font-semibold shadow-card transition-[transform,background-color,border-color,color] duration-200 active:scale-95 disabled:opacity-60 ${
        selected
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-surface-muted text-foreground hover:bg-surface"
      } ${className}`}
    >
      {icon ? (
        <span aria-hidden className="text-xl leading-none">
          {icon}
        </span>
      ) : null}
      <span className="line-clamp-2 leading-tight">{children}</span>
    </button>
  );
}

export function ChipScroller({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}
