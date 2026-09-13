import type { ReactNode } from "react";
import "./Badge.css";

type BadgeVariant = "neutral" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return <span className={`badge badge--${variant}${className ? ` ${className}` : ""}`}>{children}</span>;
}
