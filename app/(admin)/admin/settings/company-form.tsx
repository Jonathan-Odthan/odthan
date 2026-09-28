"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateCompanySettingsAction } from "@/actions/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Enregistrement..." : "Enregistrer"}
    </button>
  );
}

export default function CompanyForm({ defaultValues, readOnly }: { defaultValues: Record<string, string>; readOnly?: boolean }) {
  const [state, formAction] = useFormState(updateCompanySettingsAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Nom de l&apos;entreprise</label>
        <input name="name" defaultValue={defaultValues.name} disabled={readOnly} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" defaultValue={defaultValues.email} disabled={readOnly} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <input name="whatsapp" defaultValue={defaultValues.whatsapp} disabled={readOnly} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Site web</label>
        <input name="site" type="url" defaultValue={defaultValues.site} disabled={readOnly} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50" />
      </div>
      {!readOnly && <SubmitButton />}
    </form>
  );
}
