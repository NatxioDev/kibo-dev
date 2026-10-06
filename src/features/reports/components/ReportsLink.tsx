import Link from "next/link";

export function ReportsLink({ active = false }: { active?: boolean }) {
  return (
    <Link
      href="/reportes"
      aria-label="Reportes"
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-card transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active
          ? "border-primary/40 bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:bg-surface-muted"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M4 20h16" />
        <path d="M7 16v-5" />
        <path d="M12 16V6" />
        <path d="M17 16v-8" />
      </svg>
    </Link>
  );
}
