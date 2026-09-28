"use client";

import { useFormState, useFormStatus } from "react-dom";
import { forgotPasswordAction, type FormState } from "@/actions/auth";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring w-full rounded-lg bg-odthan-black text-white font-medium py-2.5 text-sm disabled:opacity-60">
      {pending ? "Envoi..." : "Envoyer le lien"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState<FormState, FormData>(forgotPasswordAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-odthan-white">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">Mot de passe oublie</h1>
        <p className="text-sm text-gray-500 mb-6">Recevez un lien de reinitialisation par email.</p>
        <form action={formAction} className="space-y-4">
          {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" required className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <SubmitButton />
        </form>
        <Link href="/login" className="mt-4 inline-block text-sm text-gray-500 hover:underline">Retour a la connexion</Link>
      </div>
    </div>
  );
}
