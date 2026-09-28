"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Creation..." : "Generer la facture"}
    </button>
  );
}

export default function InvoiceForm({
  action,
  clients,
  orders,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  clients: { id: string; firstName: string; lastName: string }[];
  orders: { id: string; number: string; amount: any; client: { firstName: string; lastName: string } }[];
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
        <label className="block text-sm font-medium mb-1">Commande liee (optionnel)</label>
        <select name="orderId" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Aucune</option>
          {orders.map((o) => <option key={o.id} value={o.id}>{o.number} — {o.client.firstName} {o.client.lastName} ({String(o.amount)})</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sous-total *</label>
          <input name="subtotal" type="number" min="0" step="0.01" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reduction</label>
          <input name="discount" type="number" min="0" step="0.01" defaultValue={0} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date d&apos;echeance</label>
        <input name="dueDate" type="date" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  );
}
