import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { getCurrentProfile } from "@/lib/auth/session";
import PageHeader from "@/components/ui/page-header";
import CompanyForm from "./company-form";
import ProfileForm from "./profile-form";

export const metadata = { title: "Parametres" };

export default async function SettingsPage() {
  await requirePermission("settings.view");
  const canUpdateSettings = await hasPermission("settings.update");
  const profile = await getCurrentProfile();

  const companySetting = await prisma.setting.findUnique({ where: { key: "company" } });
  const company = (companySetting?.value as any) || {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Odthan Empire",
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "odthanempire@gmail.com",
    whatsapp: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || "+50955561461",
    site: process.env.NEXT_PUBLIC_COMPANY_SITE || "https://www.odthan.com",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Parametres" description="Entreprise, profil, notifications, apparence" />

      <section className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Entreprise</h2>
        <CompanyForm defaultValues={company} readOnly={!canUpdateSettings} />
      </section>

      <section className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Mon profil</h2>
        <ProfileForm
          defaultValues={{ firstName: profile?.firstName || "", lastName: profile?.lastName || "", phone: profile?.phone || "" }}
        />
      </section>

      <section className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold mb-2">Notifications, Apparence, Systeme</h2>
        <p className="text-sm text-gray-500">
          Aucune preference specifique a configurer pour l&apos;instant au-dela de ce qui est deja actif (centre de notifications, theme clair par defaut).
          Cette section est prete a accueillir de futures preferences sans modification de schema.
        </p>
      </section>
    </div>
  );
}
