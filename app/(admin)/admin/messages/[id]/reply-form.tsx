"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "..." : "Envoyer"}
    </button>
  );
}

export default function ReplyForm({ action }: { action: (prev: any, formData: FormData) => Promise<any> }) {
  const [state, formAction] = useFormState(action, null);
  return (
    <form action={formAction} className="flex gap-2">
      {state?.error && <p className="text-sm text-odthan-red">{state.error}</p>}
      <input name="body" required placeholder="Ecrire un message..." className="focus-ring flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <SubmitButton />
    </form>
  );
}
