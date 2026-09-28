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

export default function UserForm({
  action,
  roles,
  defaultValues,
  submitLabel,
  passwordOptional,
}: {
  action: (prev: any, formData: FormData) => Promise<any>;
  roles: { id: string; label: string }[];
  defaultValues?: Partial<Record<string, string>>;
  submitLabel: string;
  passwordOptional?: boolean;
}) {
  const [state, formAction] = useFormState(action, null);
  const d = defaultValues || {};

  return (
    <form action={formAction} className="space-y-4 bg-white rounded-lg border border-gray-100 p-6 max-w-xl">
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
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input name="email" type="email" required defaultValue={d.email} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Telephone</label>
        <input name="phone" defaultValue={d.phone} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Role *</label>
          <select name="roleId" required defaultValue={d.roleId} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Selectionner...</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select name="status" defaultValue={d.status || "ACTIVE"} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
            <option value="SUSPENDED">Suspendu</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {passwordOptional ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe initial *"}
        </label>
        <input name="password" type="password" minLength={8} required={!passwordOptional} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
