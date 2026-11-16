"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import HoneypotField from "@/components/HoneypotField";
import { submitErrorMessage, useTurnstile } from "@/components/turnstile/useTurnstile";
import { TURNSTILE_ACTIONS, TURNSTILE_FIELD } from "@/lib/turnstile";
import { SITE_IMAGES } from "@/lib/site-settings";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { SocialIcons, useHasSocialLinks } from "@/components/SocialLinksProvider";

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


const inputClasses =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition";

// Native select arrows can't be positioned, so hide it and draw our own chevron.
const selectClasses = `${inputClasses} appearance-none pr-11 cursor-pointer`;

const SelectChevron = () => (
  <ChevronDownIcon
    aria-hidden="true"
    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
  />
);

interface OnboardingClientProps {
  /** Side image, set from the admin Site page. */
  imageUrl: string;
}

const DEFAULT_ONBOARDING_IMAGE = SITE_IMAGES.onboarding_image.defaultUrl;

const OnboardingClient: React.FC<OnboardingClientProps> = ({ imageUrl }) => {
  // If a custom image fails to load (e.g. it was deleted), show the original instead.
  const [sideImage, setSideImage] = useState(imageUrl || DEFAULT_ONBOARDING_IMAGE);
  const hasSocialLinks = useHasSocialLinks();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [userType, setUserType] = useState<UserType | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstile = useTurnstile(TURNSTILE_ACTIONS.waitlist);

  const handleGoBack = () => {
    if (step === "form") {
      setStep("intro");
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const turnstileToken = await turnstile.getToken();
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email, country, userType, website: honeypotRef.current?.value ?? "", [TURNSTILE_FIELD]: turnstileToken }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      toast.success("You're on the waitlist!");
      setStep("success");
    } catch (error) {
      toast.error(submitErrorMessage(error, "Network error. Check your connection and try again."));
    } finally {
      turnstile.reset();
      setIsSubmitting(false);
    }
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

              <form onSubmit={handleSubmit} className="relative mt-8 space-y-3">
                <HoneypotField ref={honeypotRef} />
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
                <div className="relative">
                  <select
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`${selectClasses} ${country ? "text-gray-900" : "text-gray-400"}`}
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
                  <SelectChevron />
                </div>
                <div className="relative">
                  <select
                    required
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className={`${selectClasses} ${userType ? "text-gray-900" : "text-gray-400"}`}
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
                  <SelectChevron />
                </div>

                {turnstile.widget}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
                >
                  {isSubmitting ? "Joining…" : "Join early access"}
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
            </div>
          )}
        </div>

        {/* Pinned to the bottom of the column, below the centred confirmation. */}
        {step === "success" && hasSocialLinks && (
          <div className="max-w-md mx-auto w-full pt-6 text-center">
            <p className="text-sm text-gray-500">Stay close to the journey. Follow us:</p>
            <SocialIcons className="mt-4 justify-center" />
          </div>
        )}
      </div>

      {/* Right: image */}
      <div className="relative hidden lg:flex lg:items-start lg:justify-center">
        <img
          src={sideImage}
          alt="Ulô experience"
          onError={() => setSideImage(DEFAULT_ONBOARDING_IMAGE)}
          className="h-[95vh] w-full object-cover rounded-b-[2.5rem]"
        />
      </div>
    </div>
  );
};

export default OnboardingClient;
