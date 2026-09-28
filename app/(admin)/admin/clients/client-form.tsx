"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Enregistrement..." : label}
    </button>
  );
}

export default function ClientForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  defaultValues?: Partial<Record<string, string>>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, null);
  const d = defaultValues || {};

  return (
    <form action={formAction} className="space-y-4 bg-white rounded-lg border border-gray-100 p-6 max-w-2xl">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prenom *</label>
          <input name="firstName" required defaultValue={d.firstName} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <input name="lastName" required defaultValue={d.lastName} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Entreprise</label>
        <input name="company" defaultValue={d.company} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" defaultValue={d.email} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telephone</label>
          <input name="phone" defaultValue={d.phone} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <input name="whatsapp" defaultValue={d.whatsapp} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select name="status" defaultValue={d.status || "ACTIVE"} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Adresse</label>
        <input name="address" defaultValue={d.address} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pays</label>
          <input name="country" defaultValue={d.country} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ville</label>
          <input name="city" defaultValue={d.city} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes internes</label>
        <textarea name="notes" rows={3} defaultValue={d.notes} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
