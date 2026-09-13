import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </button>
  );
}
