import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-8 transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
