"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="focus-ring rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium">
      Imprimer / Exporter PDF
    </button>
  );
}
