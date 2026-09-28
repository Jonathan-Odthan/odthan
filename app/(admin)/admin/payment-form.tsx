"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Enregistrement..." : "Enregistrer le paiement"}
    </button>
  );
}

export default function PaymentForm({
  action,
  clients,
  orders,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  clients: { id: string; firstName: string; lastName: string }[];
  orders: { id: string; number: string; client: { firstName: string; lastName: string } }[];
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
          {orders.map((o) => <option key={o.id} value={o.id}>{o.number} — {o.client.firstName} {o.client.lastName}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Montant *</label>
          <input name="amount" type="number" min="0.01" step="0.01" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Devise</label>
          <select name="currency" defaultValue="HTG" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="HTG">HTG</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Methode *</label>
        <select name="method" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="CASH">Especes</option>
          <option value="BANK_TRANSFER">Virement bancaire</option>
          <option value="MONCASH">MonCash</option>
          <option value="NATCASH">NatCash</option>
          <option value="CARD">Carte</option>
          <option value="OTHER">Autre</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Reference (optionnel)</label>
        <input name="reference" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  );
}
