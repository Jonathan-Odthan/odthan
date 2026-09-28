export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-odthan-white text-odthan-black px-6 text-center">
      <p className="text-sm font-semibold tracking-widest text-odthan-red">404</p>
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-gray-500 max-w-md">La page que vous cherchez n&apos;existe pas ou a ete deplacee.</p>
      <a href="/" className="mt-4 rounded-lg bg-odthan-black text-white px-4 py-2 text-sm font-medium">Retour a l&apos;accueil</a>
    </div>
  );
}
