import type { ComponentProps, ElementType } from "react";

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  variant?: "default" | "hero";
} & Omit<ComponentProps<T>, "as">;

const variantClass = {
  default: "border border-border bg-surface",
  hero: "hero-bg glass-lens border border-white/10 text-hero-foreground",
};

export function Card<T extends ElementType = "div">({
  as,
  variant = "default",
  className = "",
  ...rest
}: CardProps<T>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={`glass rounded-card shadow-card ${variantClass[variant]} ${className}`}
      {...rest}
    />
  );
}
