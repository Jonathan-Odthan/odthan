"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateOwnProfileAction } from "@/actions/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Enregistrement..." : "Enregistrer"}
    </button>
  );
}

export default function ProfileForm({ defaultValues }: { defaultValues: Record<string, string> }) {
  const [state, formAction] = useFormState(updateOwnProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prenom</label>
          <input name="firstName" defaultValue={defaultValues.firstName} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input name="lastName" defaultValue={defaultValues.lastName} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Telephone</label>
        <input name="phone" defaultValue={defaultValues.phone} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  );
}
