"use client";

import { useState } from "react";

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="rounded-xl border border-[#D4AF37]/20 bg-[#0D0D0D]">
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-white">{faq.question}</span>
              <span className="text-[#D4AF37]">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-6 pb-4 text-sm leading-relaxed text-[#A0A0A0]">{faq.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
