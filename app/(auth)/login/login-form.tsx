"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type FormState } from "@/actions/auth";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring w-full rounded-lg bg-odthan-black text-white font-medium py-2.5 text-sm disabled:opacity-60"
    >
      {pending ? "Connexion..." : "Se connecter"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState<FormState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state?.error && (
        <p role="alert" className="text-sm text-odthan-red bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
          <Link href="/forgot-password" className="text-xs text-odthan-red hover:underline">Oublie ?</Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="focus-ring w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
