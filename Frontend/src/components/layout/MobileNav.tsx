"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Library, Sparkles } from "lucide-react";

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/assignments", icon: ClipboardList, label: "Assignments" },
  { href: "#", icon: Library, label: "Library" },
  { href: "#", icon: Sparkles, label: "AI Toolkit" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 text-white flex justify-around py-3 px-2 safe-area-pb">
      {items.map(({ href, icon: Icon, label }) => {
        const active =
          label === "Assignments"
            ? pathname.startsWith("/assignments")
            : pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 text-xs ${
              active ? "text-orange-400" : "text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
