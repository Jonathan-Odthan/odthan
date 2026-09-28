"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changeOwnPasswordAction } from "@/actions/security";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
      {pending ? "Enregistrement..." : "Mettre a jour"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState(changeOwnPasswordAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
        <input name="currentPassword" type="password" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
        <input name="newPassword" type="password" minLength={8} required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  );
}
