"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#D4AF37] text-[#050505] hover:bg-[#F1D77A] shadow-[0_0_20px_rgba(212,175,55,0.25)]",
  secondary:
    "bg-transparent border border-[#D4AF37] text-[#F1D77A] hover:bg-[#D4AF37]/10",
  ghost: "bg-transparent text-white hover:text-[#F1D77A]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
    );
  }
);
Button.displayName = "Button";
