import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = BaseProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    keyof BaseProps | "href"
  >;

type ButtonAsButton = BaseProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    keyof BaseProps
  >;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-card hover:opacity-90",
  secondary:
    "glass border border-border bg-surface text-foreground shadow-card hover:bg-surface-muted",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  danger: "bg-expense text-white shadow-card hover:opacity-90",
  destructive:
    "glass border border-border bg-surface text-expense shadow-card hover:bg-expense/10",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: Pick<BaseProps, "variant" | "size" | "className"> = {}) {
  return `inline-flex items-center justify-center gap-2 rounded-control font-semibold tracking-tight transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.96] active:duration-100 disabled:pointer-events-none disabled:opacity-60 ${variantClass[variant]} ${sizeClass[size]} ${className}`;
}

export function Button(props: ButtonProps) {
  const { variant, size, className, children, ...rest } = props;
  const classes = buttonClassName({ variant, size, className });

  if (rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as ComponentProps<"button">;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
