"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Creation..." : "Creer la commande"}
    </button>
  );
}

export default function OrderForm({
  action,
  clients,
  agents,
  requests,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  clients: { id: string; firstName: string; lastName: string }[];
  agents: { id: string; firstName: string; lastName: string }[];
  requests: { id: string; number: string; client: { firstName: string; lastName: string } }[];
}) {
  const [state, formAction] = useFormState(action, null);

  return (
    <form action={formAction} className="space-y-4 bg-white rounded-lg border border-gray-100 p-6 max-w-xl">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Client *</label>
        <select name="clientId" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Selectionner...</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Demande liee (optionnel)</label>
        <select name="requestId" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Aucune</option>
          {requests.map((r) => <option key={r.id} value={r.id}>{r.number} — {r.client.firstName} {r.client.lastName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Montant (HTG) *</label>
        <input name="amount" type="number" min="0" step="0.01" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Responsable</label>
          <select name="assigneeId" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Non assigne</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date limite</label>
          <input name="dueDate" type="date" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea name="notes" rows={3} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  );
}
