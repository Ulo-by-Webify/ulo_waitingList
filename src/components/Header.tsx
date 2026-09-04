"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Experiences", href: "/experiences" },
  { label: "How Ulô Works", href: "/how-it-works" },
  { label: "Journal", href: "/journal" },
];

interface HeaderProps {
  overlay?: boolean;
  theme?: "dark" | "light";
}

export default function Header({ overlay = true, theme = "dark" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLight = theme === "light";

  return (
    <header
      className={overlay ? "absolute inset-x-0 top-0 z-50" : "relative z-50"}
    >
      <nav className="flex items-center justify-between px-6 sm:px-10 lg:px-12 py-6 sm:py-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <img
              className="w-[60px] lg:w-[80px] h-auto"
              src={isLight ? "/logo-dark.png" : "/logo-light.png"}
              alt="logo"
            />
          </Link>
        </div>

        {/* Mobile burger */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            <HiMiniBars3BottomLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <div
            className={`hidden md:flex items-center space-x-16 px-12 py-4 rounded-full backdrop-blur-md ${
              isLight
                ? "text-gray-900 bg-[rgb(237,228,213)] border border-[rgb(225,210,185)]"
                : "text-white bg-white/10 border border-white/40"
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:opacity-70 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:flex-1 items-center lg:justify-end">
          <Link
            href="/begin-your-journey"
            className={`group inline-flex items-center gap-1.5 font-medium underline underline-offset-4 decoration-1 hover:opacity-70 transition ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            Begin Your Journey
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Menu */}
        <Dialog
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          className="lg:hidden"
        >
          <div className="fixed inset-0 z-50 bg-black/50" />

          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img src="/logo-dark.png" alt="logo" className="w-[60px]" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 space-y-6 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-gray-900 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="py-6 space-y-4">
              <Link
                href="/begin-your-journey"
                onClick={() => setMobileMenuOpen(false)}
                className="group inline-flex items-center gap-1.5 text-[#060809] font-medium underline underline-offset-4 decoration-1"
              >
                Begin Your Journey
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </DialogPanel>
        </Dialog>
      </nav>
    </header>
  );
}
