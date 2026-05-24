"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Sparkles,
  Library,
  Settings,
  Plus,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "#", label: "My Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, badge: true },
  { href: "#", label: "AI Teacher's Toolkit", icon: Sparkles },
  { href: "#", label: "My Library", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();
  const assignmentCount =
    pathname.startsWith("/assignments") ? undefined : undefined;

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
          V
        </div>
        <span className="font-semibold text-lg">VedaAI</span>
      </div>

      <Link
        href="/assignments/create"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-6 rounded-full bg-gray-900 text-white text-sm font-medium shadow-[0_0_0_2px_rgba(249,115,22,0.4)] hover:bg-gray-800 transition"
      >
        <Plus className="w-4 h-4" />
        Create Assignment
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            label === "Assignments"
              ? pathname.startsWith("/assignments")
              : pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
              {label === "Assignments" && assignmentCount !== undefined && (
                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
            DPS
          </div>
          <p className="text-xs text-gray-700 leading-tight">
            Delhi Public School, Bokaro Steel City
          </p>
        </div>
      </div>
    </aside>
  );
}
