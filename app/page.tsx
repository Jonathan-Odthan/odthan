"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction, type FormState } from "@/actions/auth";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="focus-ring w-full rounded-lg bg-odthan-black text-white font-medium py-2.5 text-sm disabled:opacity-60">
      {pending ? "Mise a jour..." : "Reinitialiser"}
    </button>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, formAction] = useFormState<FormState, FormData>(resetPasswordAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && <p className="text-sm text-odthan-red bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
        <input id="password" name="password" type="password" required minLength={8} className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-odthan-white">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">Reinitialiser le mot de passe</h1>
        <p className="text-sm text-gray-500 mb-6">Choisissez un nouveau mot de passe.</p>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
