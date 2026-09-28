"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateRequestStatusAction } from "@/actions/requests";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring w-full rounded-lg bg-odthan-black text-white text-sm font-medium py-2 disabled:opacity-60">
      {pending ? "Mise a jour..." : "Mettre a jour"}
    </button>
  );
}

export default function StatusForm({ requestId, statuses, currentStatus }: { requestId: string; statuses: string[]; currentStatus: string }) {
  const action = updateRequestStatusAction.bind(null, requestId);
  const [state, formAction] = useFormState(action, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      <select name="status" defaultValue={currentStatus} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <textarea name="note" placeholder="Note (optionnel)" rows={2} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <SubmitButton />
    </form>
  );
}
