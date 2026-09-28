import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { getSession } from "@/lib/auth/session";
import PageHeader from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils/format";
import ChangePasswordForm from "./change-password-form";
import { revokeSessionAction } from "@/actions/security";
import ConfirmSubmitButton from "@/components/ui/confirm-submit-button";

export const metadata = { title: "Securite" };

export default async function SecurityPage() {
  await requirePermission("security.view");
  const session = await getSession();

  const sessions = session
    ? await prisma.session.findMany({
        where: { profileId: session.sub, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Securite" description="Mot de passe et sessions actives" />

      <section className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Changer mon mot de passe</h2>
        <ChangePasswordForm />
      </section>

      <section className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Sessions actives</h2>
        <ul className="divide-y divide-gray-100 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{s.userAgent || "Appareil inconnu"}</p>
                <p className="text-xs text-gray-400">IP {s.ip || "inconnue"} — connecte le {formatDate(s.createdAt)}</p>
              </div>
              {s.id !== session?.sid && (
                <form action={revokeSessionAction.bind(null, s.id)}>
                  <ConfirmSubmitButton confirmMessage="Fermer cette session ?" className="text-xs rounded-lg border border-red-200 text-odthan-red px-3 py-1.5">
                    Fermer
                  </ConfirmSubmitButton>
                </form>
              )}
              {s.id === session?.sid && <span className="text-xs text-gray-400">Session actuelle</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
