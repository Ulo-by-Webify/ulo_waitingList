"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaReddit,
} from "react-icons/fa6";

export type UserType = "host" | "guest" | "associate";

type Step = "intro" | "form" | "success";

const whyJoinItems = [
  {
    title: "Early access to the best stays and experiences",
    description: "Explore curated homes and services before they're widely available.",
  },
  {
    title: "Priority entry before invite-only access begins",
    description: "Secure your place before access becomes restricted.",
  },
  {
    title: "Be part of the first users shaping Ulô",
    description: "Your experience helps define how the platform evolves.",
  },
];

const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Morocco",
  "Ethiopia",
  "Tanzania",
  "Uganda",
  "Senegal",
  "Côte d'Ivoire",
  "Rwanda",
  "Cameroon",
  "Zambia",
  "Zimbabwe",
  "United States",
  "United Kingdom",
  "Canada",
  "France",
  "Germany",
  "United Arab Emirates",
  "Other",
];

const socialLinks = [
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaFacebook, href: "#", label: "Facebook" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaXTwitter, href: "#", label: "X" },
  { icon: FaReddit, href: "#", label: "Reddit" },
];

const inputClasses =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition";

const OnboardingClient: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [userType, setUserType] = useState<UserType | "">("");

  const handleGoBack = () => {
    if (step === "form") {
      setStep("intro");
    } else {
      router.push("/");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("success");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F7F1E8] grid grid-cols-1 lg:grid-cols-2">
      {/* Left: content */}
      <div className="relative flex flex-col px-8 py-8 sm:px-14 sm:py-10 overflow-y-auto">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:opacity-70 transition self-start"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Go Back
        </button>

        <div className="flex-1 flex flex-col justify-center py-8">
          {step === "intro" && (
            <div className="max-w-md mx-auto w-full">
              <h1 className="text-3xl sm:text-[2rem] font-semibold text-gray-900 leading-tight text-center">
                Get early access before Ulô becomes{" "}
                <span className="font-bold">invite-only</span>
              </h1>
              <p className="mt-4 text-center text-gray-600">
                A more personal way to explore Africa, before it opens to everyone.
              </p>

              <h2 className="mt-10 text-sm font-semibold text-gray-900">
                Why join now ?
              </h2>

              <div className="mt-4 divide-y divide-gray-200">
                {whyJoinItems.map((item) => (
                  <div key={item.title} className="flex gap-3 py-4 first:pt-0">
                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0 mt-1 text-gray-900" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="mt-8 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Get Early Access
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs text-gray-500">
                No spam. Just your invitation when we open.
              </p>
            </div>
          )}

          {step === "form" && (
            <div className="max-w-md mx-auto w-full">
              <h1 className="text-3xl font-semibold text-gray-900 text-center">
                You&apos;re one step away
              </h1>
              <p className="mt-2 text-center text-gray-600">
                Be among the first to explore, book, and experience.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={inputClasses}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className={inputClasses}
                />
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`${inputClasses} ${country ? "text-gray-900" : "text-gray-400"}`}
                >
                  <option value="" disabled>
                    Select your country of residence
                  </option>
                  {countries.map((c) => (
                    <option key={c} value={c} className="text-gray-900">
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  required
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className={`${inputClasses} ${userType ? "text-gray-900" : "text-gray-400"}`}
                >
                  <option value="" disabled>
                    I&apos;m here to:
                  </option>
                  <option value="guest" className="text-gray-900">
                    Explore &amp; book stays
                  </option>
                  <option value="host" className="text-gray-900">
                    Host my home
                  </option>
                  <option value="associate" className="text-gray-900">
                    Become an Associate
                  </option>
                </select>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Join early access
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-3 text-center text-xs text-gray-500">
                No spam. Just your invitation when we open.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="max-w-md mx-auto w-full text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                You&apos;re in early
              </h1>
              <p className="mt-4 text-gray-600">
                You&apos;ll be among the first to access Ulô before it becomes
                invite-only.
              </p>

              <div className="mt-8 border-t border-gray-300" />

              <p className="mt-8 text-sm text-gray-500">
                We&apos;ll let you know the moment we open.
              </p>

              <div className="mt-16">
                <p className="text-sm text-gray-500">
                  Stay close to the journey. Follow us:
                </p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="text-gray-900 hover:opacity-70 transition"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: image */}
      <div className="relative hidden lg:flex lg:items-start lg:justify-center">
        <img
          src="/auth-img.jpg"
          alt="Ulô experience"
          className="h-[95vh] w-full object-cover rounded-b-[2.5rem]"
        />
      </div>
    </div>
  );
};

export default OnboardingClient;
