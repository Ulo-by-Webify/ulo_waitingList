"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const CLOSE_DELAY_MS = 150;

const ITEMS = [
  { href: "/admin/account", label: "Profile", icon: UserCircleIcon },
  { href: "/admin/account/security", label: "Security", icon: ShieldCheckIcon },
];
const TEAM_ITEM = { href: "/admin/team", label: "Team", icon: UserGroupIcon };

/**
 * Avatar + name that opens on hover (pointer), click/tap, or keyboard (Enter/Space/ArrowDown).
 * A short close delay lets the pointer travel from the trigger into the menu.
 */
export default function AccountMenu({ displayName, canManageTeam }: { displayName: string; canManageTeam: boolean }) {
  const items = canManageTeam ? [...ITEMS, TEAM_ITEM] : ITEMS;
  const router = useRouter();
  const pathname = usePathname();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const open = () => {
    clearTimeout(closeTimer.current);
    setIsOpen(true);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Close on route change.
  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function focusFirstItem() {
    requestAnimationFrame(() => containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
  }

  function handleMenuKeyDown(event: React.KeyboardEvent) {
    const items = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:outline-none";

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && open()}
      onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            open();
            focusFirstItem();
          }
        }}
        className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
          isOpen ? "bg-gray-100 text-gray-900" : "text-gray-700"
        }`}
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-white"
        >
          {displayName.charAt(0)}
        </span>
        <span className="hidden max-w-[180px] truncate font-medium sm:inline">{displayName}</span>
        <span className="sr-only sm:hidden">Account menu for {displayName}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isOpen && (
        // pt-2 bridges the gap between trigger and panel so hover isn't lost in transit.
        <div className="absolute right-0 top-full z-50 pt-2">
          <div
            id={menuId}
            role="menu"
            aria-label="Account"
            onKeyDown={handleMenuKeyDown}
            className="w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
          >
            <p className="truncate px-3 pb-2 pt-1.5 text-xs text-gray-500">Signed in as {displayName}</p>
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                aria-current={pathname === href ? "page" : undefined}
                className={`${itemClass} ${pathname === href ? "bg-gray-50 font-medium text-gray-900" : ""}`}
              >
                <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <div className="my-1 border-t border-gray-100" />
            <button type="button" role="menuitem" onClick={handleLogout} className={`${itemClass} text-red-600 hover:text-red-700`}>
              <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
