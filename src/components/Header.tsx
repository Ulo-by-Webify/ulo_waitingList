import { Link } from "react-router-dom";
import { useState, useRef, RefObject } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { HowToJoinSectionRef } from "@/components/HowToJoinSection";

interface NavbarProps {
  howToJoinSectionRef: RefObject<HowToJoinSectionRef>;
}

export default function Navbar({ howToJoinSectionRef }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  // Generic scroll function
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const scrollToJoinSection = () => {
    howToJoinSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-10 lg:px-12">
        
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img
              className="w-[60px] lg:w-[80px] h-auto"
              src="/logo-light.png"
              alt="logo"
            />
          </Link>
        </div>

        {/* Mobile burger */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
          >
            <HiMiniBars3BottomLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <div className="hidden md:flex items-center space-x-16 px-12 py-4 rounded-full text-white bg-white/10 border border-white/40 backdrop-blur-md">

            <button
              onClick={() => scrollToSection("handsfree-section-1")}
              className="hover:opacity-70 transition"
            >
              Products
            </button>

            <button
              onClick={() => scrollToSection("xperience-section-1")}
              className="hover:opacity-70 transition"
            >
              Services
            </button>

            <button
              onClick={() => scrollToSection("borderless-section-1")}
              className="hover:opacity-70 transition"
            >
              Community
            </button>

          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:flex-1 items-center lg:justify-end">
          <button
            onClick={scrollToJoinSection}
            className="group inline-flex items-center rounded-full border border-white px-2 py-2 transition duration-300"
          >
            <span className="text-white font-light pl-2">
              Experience Ulô
            </span>
            <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-white transition-all duration-300 group-hover:-translate-x-2">
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </button>
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
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="/logo-dark.png"
                  alt="logo"
                  className="w-[60px]"
                />
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

              <button
                onClick={() => scrollToSection("handsfree-section-1")}
                className="block w-full text-left text-gray-900 font-medium"
              >
                Products
              </button>

              <button
                onClick={() => scrollToSection("xperience-section-1")}
                className="block w-full text-left text-gray-900 font-medium"
              >
                Services
              </button>

              <button
                onClick={() => scrollToSection("borderless-section-1")}
                className="block w-full text-left text-gray-900 font-medium"
              >
                Community
              </button>

            </div>

            {/* Mobile CTA */}
            <div className="py-6 space-y-4">
              <button
                onClick={scrollToJoinSection}
                className="group inline-flex w-full justify-center items-center rounded-full border-[#060809] border px-3 py-3 transition duration-300"
              >
                <span className="text-[#060809] font-light pl-2">
                  Experience Ulô
                </span>
                <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-[#060809] transition-all duration-300 group-hover:-translate-y-1">
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
            </div>

          </DialogPanel>
        </Dialog>
      </nav>
    </header>
  );
}