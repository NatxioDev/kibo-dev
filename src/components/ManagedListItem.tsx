"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/Switch";

type ManagedListItemProps = {
  icon?: ReactNode;
  /** Background for the icon tile; defaults to the muted surface. */
  iconBackground?: string;
  name: string;
  href: string;
  isActive: boolean;
  /** Spanish agreement differs per catalog ("Desactivada" / "Desactivado"). */
  inactiveLabel: string;
  loading: boolean;
  error: string | null;
  onActivate: () => void;
  onRequestDeactivate: () => void;
};

/** Row for user-managed catalogs: tap to edit, switch to (de)activate. */
export function ManagedListItem({
  icon,
  iconBackground,
  name,
  href,
  isActive,
  inactiveLabel,
  loading,
  error,
  onActivate,
  onRequestDeactivate,
}: ManagedListItemProps) {
  return (
    <li className="flex flex-col">
      <div className="flex items-center gap-2 pr-4">
        <Link
          href={href}
          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl py-3 pl-4 transition-colors hover:bg-surface-muted"
        >
          {icon ? (
            <span
              aria-hidden
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg transition-opacity ${
                iconBackground ? "" : "bg-surface-muted"
              } ${isActive ? "" : "opacity-45 grayscale"}`}
              style={iconBackground ? { backgroundColor: iconBackground } : undefined}
            >
              {icon}
            </span>
          ) : null}
          <span className="min-w-0 flex-1">
            <span
              className={`block truncate text-[0.9375rem] font-semibold ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {name}
            </span>
            {isActive ? null : (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {inactiveLabel}
              </span>
            )}
          </span>
        </Link>
        <Switch
          checked={isActive}
          disabled={loading}
          label={`Activar ${name}`}
          onChange={(next) => (next ? onActivate() : onRequestDeactivate())}
        />
      </div>
      {error ? (
        <p className="px-4 pb-3 text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
