"use client";

import { useTransition } from "react";
import { updateTaskStatusAction } from "@/actions/tasks";

const STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function TaskStatusSelect({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => { updateTaskStatusAction(taskId, e.target.value); })}
      className="focus-ring rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white disabled:opacity-60"
    >
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
