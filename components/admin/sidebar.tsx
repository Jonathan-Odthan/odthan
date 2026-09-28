"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-config";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

export default function Sidebar({ allowedHrefs }: { allowedHrefs: Set<string> }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => allowedHrefs.has(item.href));

  const content = (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
      {items.map((item) => {
        const Icon = (Icons as any)[item.icon] ?? Icons.Circle;
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-odthan-red text-white" : "text-gray-300 hover:bg-odthan-dark-2 hover:text-white"
            )}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-odthan-black text-white h-screen sticky top-0 transition-all",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
          {collapsed ? (
            <img src="/branding/favicon.png" alt="Odthan" className="h-8 w-8" />
          ) : (
            <div className="bg-white rounded-md px-2 py-1">
              <img src="/branding/logo.png" alt="Odthan" className="h-5 w-auto" />
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="focus-ring text-gray-400 hover:text-white"
            aria-label="Reduire la barre laterale"
          >
            <Icons.PanelLeft size={18} />
          </button>
        </div>
        {content}
      </aside>

      {/* Mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="focus-ring fixed bottom-4 left-4 z-40 bg-odthan-black text-white rounded-full p-3 shadow-lg"
          aria-label="Ouvrir le menu"
        >
          <Icons.Menu size={20} />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-72 bg-odthan-black text-white h-full flex flex-col">
              <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
                <div className="bg-white rounded-md px-2 py-1">
                  <img src="/branding/logo.png" alt="Odthan" className="h-5 w-auto" />
                </div>
                <button onClick={() => setMobileOpen(false)} className="focus-ring text-gray-400" aria-label="Fermer">
                  <Icons.X size={20} />
                </button>
              </div>
              <div onClick={() => setMobileOpen(false)}>{content}</div>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}
