"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function Pagination({ total, pageSize, currentPage }: { total: number; pageSize: number; currentPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-gray-500">Page {currentPage} sur {totalPages}</p>
      <div className="flex gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => goTo(currentPage - 1)}
          className="focus-ring rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 bg-white"
        >
          Precedent
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => goTo(currentPage + 1)}
          className="focus-ring rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 bg-white"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
