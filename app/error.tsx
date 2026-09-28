"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white text-black px-6 text-center">
          <p className="text-sm font-semibold tracking-widest text-red-600">500</p>
          <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
          <p className="text-gray-500 max-w-md">
            Quelque chose s&apos;est mal passe de notre cote. L&apos;equipe technique a ete notifiee via les journaux serveur.
          </p>
          <button onClick={() => reset()} className="mt-4 rounded-lg bg-black text-white px-4 py-2 text-sm font-medium">
            Reessayer
          </button>
        </div>
      </body>
    </html>
  );
}
