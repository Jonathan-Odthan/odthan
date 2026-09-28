import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Header({ profile }: { profile: { firstName: string; lastName: string; role: { label: string } } }) {
  const unreadCount = await prisma.notification.count({ where: { readAt: null } }).catch(() => 0);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/90 backdrop-blur px-4 lg:px-6 py-3">
      <form action="/admin/search" className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="focus-within:ring-2 focus-within:ring-odthan-red/40 flex items-center gap-2 w-full rounded-lg border border-gray-200 px-3 py-2 bg-odthan-gray">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            placeholder="Rechercher clients, commandes, paiements..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </form>

      <div className="flex items-center gap-4 ml-auto">
        <Link href="/admin/notifications" className="focus-ring relative text-gray-500 hover:text-odthan-black">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-odthan-red text-white text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-2 focus-ring rounded-lg">
          <div className="h-8 w-8 rounded-full bg-odthan-black text-white flex items-center justify-center text-xs font-semibold">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-none">{profile.firstName} {profile.lastName}</p>
            <p className="text-xs text-gray-500">{profile.role.label}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
