import LoginForm from "./login-form";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Connexion" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin/dashboard");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-odthan-white">
      <div className="hidden lg:flex flex-col justify-between bg-odthan-black text-white p-12">
        <div className="bg-white rounded-md px-3 py-2 w-fit">
          <img src="/branding/logo.png" alt="Odthan" className="h-8 w-auto" />
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight">
            ODTHAN <span className="text-odthan-red">ADMIN CENTER</span>
          </h1>
          <p className="mt-3 text-gray-400 max-w-sm">
            Gerez clients, services, commandes, paiements et documents d&apos;Odthan Empire depuis une seule interface.
          </p>
        </div>
        <p className="text-xs text-gray-500">www.odthan.com</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <img src="/branding/favicon.png" alt="Odthan" className="h-10 w-10 mb-6 lg:hidden" />
          <h2 className="text-xl font-bold mb-1">Connexion</h2>
          <p className="text-sm text-gray-500 mb-6">Acces reserve a l&apos;equipe Odthan.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
