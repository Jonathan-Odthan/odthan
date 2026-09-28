"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils/cn";

export default function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
}: {
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      className={cn("focus-ring text-sm font-medium disabled:opacity-60", className)}
    >
      {pending ? "..." : children}
    </button>
  );
}
