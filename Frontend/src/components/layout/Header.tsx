"use client";

import Link from "next/link";
import { ArrowLeft, Bell, ChevronDown } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
}

export function Header({ title, subtitle, backHref = "/assignments" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 lg:px-8 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 rounded-lg hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
          <span className="text-sm font-medium hidden sm:inline">John Doe</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
