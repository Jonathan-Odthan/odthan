"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Envoi..." : "Televerser"}
    </button>
  );
}

export default function UploadForm({
  action,
  clients,
  orders,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  clients: { id: string; firstName: string; lastName: string }[];
  orders: { id: string; number: string }[];
}) {
  const [state, formAction] = useFormState(action, null);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-4 bg-white rounded-lg border border-gray-100 p-6 max-w-xl">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Fichier * (PDF, image, Word, Excel — 15 Mo max)</label>
        <input name="file" type="file" required className="focus-ring w-full text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type de document *</label>
        <select name="type" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="CLIENT">Document client</option>
          <option value="COMPANY">Document entreprise</option>
          <option value="CONTRACT">Contrat</option>
          <option value="INVOICE">Facture</option>
          <option value="WORK_FILE">Fichier de travail</option>
          <option value="FINAL_DELIVERABLE">Livrable final</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Client lie (optionnel)</label>
        <select name="clientId" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Aucun</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Commande liee (optionnel)</label>
        <select name="orderId" className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Aucune</option>
          {orders.map((o) => <option key={o.id} value={o.id}>{o.number}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPrivate" defaultChecked className="rounded" />
        Document prive (recommande)
      </label>
      <SubmitButton />
    </form>
  );
}
