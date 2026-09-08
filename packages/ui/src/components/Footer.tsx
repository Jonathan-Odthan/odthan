import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-[#D4AF37]/15 bg-[#050505] text-[#A0A0A0]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <Logo size="md" />
          <p className="mt-4 text-sm leading-relaxed">
            Construire. Investir. Développer.
            <br />
            Un écosystème digital multi-activités.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#F1D77A]">Activités</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://investir.odthan.com" className="hover:text-[#F1D77A]">ODTHAN Investir</a></li>
            <li><a href="https://auto.odthan.com" className="hover:text-[#F1D77A]">ODTHAN Auto</a></li>
            <li><a href="https://business.odthan.com" className="hover:text-[#F1D77A]">ODTHAN Business</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#F1D77A]">Entreprise</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/a-propos" className="hover:text-[#F1D77A]">À propos</Link></li>
            <li><Link href="/blog" className="hover:text-[#F1D77A]">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-[#F1D77A]">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-[#F1D77A]">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-[#F1D77A]">Légal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/confidentialite" className="hover:text-[#F1D77A]">Confidentialité</Link></li>
            <li><Link href="/conditions" className="hover:text-[#F1D77A]">Conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#D4AF37]/10 py-6 text-center text-xs">
        © {new Date().getFullYear()} ODTHAN. Tous droits réservés.
      </div>
    </footer>
  );
}
