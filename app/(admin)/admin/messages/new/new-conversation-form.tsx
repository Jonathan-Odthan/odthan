"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Envoi..." : "Demarrer la conversation"}
    </button>
  );
}

export default function NewConversationForm({
  action,
  clients,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  clients: { id: string; firstName: string; lastName: string }[];
}) {
  const [state, formAction] = useFormState(action, null);

  return (
    <form action={formAction} className="space-y-4 bg-white rounded-lg border border-gray-100 p-6 max-w-xl">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Sujet (optionnel)</label>
        <input name="subject" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Client lie (optionnel)</label>
        <select name="clientId" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Aucun</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message *</label>
        <textarea name="body" rows={4} required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  );
}
