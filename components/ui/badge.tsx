import { cn } from "@/lib/utils/cn";

const COLORS: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700",
  red: "bg-red-50 text-odthan-red",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
};

export default function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: keyof typeof COLORS }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", COLORS[color])}>
      {children}
    </span>
  );
}
