type KiboMarkProps = {
  className?: string;
};

export function KiboMark({ className = "" }: KiboMarkProps) {
  return (
    <span
      aria-hidden
      className={`hero-bg inline-flex items-center justify-center rounded-[30%] border border-white/15 text-hero-foreground shadow-card ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="none">
        <path
          d="M7 4v16M7 12l9-8M10 9.5 17 20"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
