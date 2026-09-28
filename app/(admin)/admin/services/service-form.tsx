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

export default function ServiceForm({
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
    <form action={formAction} className="space-y-4 bg-white rounded-lg border border-gray-100 p-6 max-w-xl">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Nom *</label>
        <input name="name" required defaultValue={d.name} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows={3} defaultValue={d.description} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prix (HTG) *</label>
          <input name="price" type="number" min="0" step="0.01" required defaultValue={d.price} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select name="status" defaultValue={d.status || "ACTIVE"} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
          </select>
        </div>
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
