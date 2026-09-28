import { cn } from "@/lib/utils/cn";
import * as Icons from "lucide-react";

export default function StatCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Icons;
  accent?: boolean;
}) {
  const Icon = (Icons as any)[icon] ?? Icons.Circle;
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", accent ? "bg-odthan-red/10 text-odthan-red" : "bg-odthan-black/5 text-odthan-black")}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
