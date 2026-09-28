export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-odthan-white text-odthan-black px-6 text-center">
      <p className="text-sm font-semibold tracking-widest text-odthan-red">403</p>
      <h1 className="text-2xl font-bold">Acces refuse</h1>
      <p className="text-gray-500 max-w-md">
        Vous n&apos;avez pas la permission d&apos;acceder a cette page. Contactez un administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
      </p>
      <a href="/admin/dashboard" className="mt-4 rounded-lg bg-odthan-black text-white px-4 py-2 text-sm font-medium">
        Retour au tableau de bord
      </a>
    </div>
  );
}
