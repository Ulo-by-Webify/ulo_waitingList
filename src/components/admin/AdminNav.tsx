"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { can, homeFor, type Permission, type Role } from "@/lib/permissions";
import AccountMenu from "./AccountMenu";

const LINKS: { href: string; label: string; permission: Permission }[] = [
  { href: "/admin", label: "Waitlist", permission: "waitlist" },
  { href: "/admin/journal", label: "Journal", permission: "journal" },
  { href: "/admin/traffic", label: "Traffic", permission: "traffic" },
  { href: "/admin/media", label: "Media", permission: "media" },
  { href: "/admin/home", label: "Home", permission: "site" },
  { href: "/admin/experiences", label: "Experiences", permission: "site" },
  { href: "/admin/site", label: "Site", permission: "site" },
];

export default function AdminNav({ displayName, role }: { displayName: string; role: Role }) {
  const pathname = usePathname();
  const links = LINKS.filter((link) => can(role, link.permission));

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={homeFor(role)} className="flex items-center gap-3" aria-label="Ulô Admin home">
            <img src="/logo-dark.png" alt="" width={973} height={638} className="h-auto w-[76px]" />
          </Link>
          <nav className="flex gap-1">
            {links.map((link) => {
              const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm transition ${
                    active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <AccountMenu displayName={displayName} canManageTeam={can(role, "team")} />
      </div>
    </header>
  );
}
