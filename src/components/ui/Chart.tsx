"use client";

import type { ComponentProps, CSSProperties, ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

export type ChartConfig = Record<string, { label: string; color: string }>;

type ChartContainerProps = {
  config: ChartConfig;
  children: ReactElement;
} & Omit<ComponentProps<"div">, "children">;

/**
 * shadcn/ui-style chart shell: each config key becomes a `--chart-<key>` CSS
 * variable so series colors follow the theme tokens (and dark mode).
 */
export function ChartContainer({
  config,
  children,
  className = "",
  style,
  ...rest
}: ChartContainerProps) {
  const colorVars = Object.fromEntries(
    Object.entries(config).map(([key, { color }]) => [`--chart-${key}`, color]),
  );

  return (
    <div
      className={`relative text-xs [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none ${className}`}
      style={{ ...colorVars, ...style } as CSSProperties}
      {...rest}
    >
      <ResponsiveContainer initialDimension={{ width: 320, height: 176 }}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
