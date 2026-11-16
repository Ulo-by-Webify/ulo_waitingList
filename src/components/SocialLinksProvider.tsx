"use client";

import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaReddit,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SOCIAL_NETWORKS, type SocialLinks, type SocialNetworkId } from "@/lib/social-links";

const SocialLinksContext = createContext<SocialLinks>({});

/** Makes the admin-managed social links (loaded once in the root layout) available to any page. */
export function SocialLinksProvider({ links, children }: { links: SocialLinks; children: ReactNode }) {
  return <SocialLinksContext.Provider value={links}>{children}</SocialLinksContext.Provider>;
}

export function useSocialLinks(): SocialLinks {
  return useContext(SocialLinksContext);
}

const ICONS: Record<SocialNetworkId, ComponentType<{ className?: string }>> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
  reddit: FaReddit,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
};

/** True when at least one network has a link. */
export function useHasSocialLinks(): boolean {
  const links = useSocialLinks();
  return SOCIAL_NETWORKS.some((network) => Boolean(links[network.id]));
}

/** Icon links for every network that has a URL set, in the order defined in SOCIAL_NETWORKS. */
export function SocialIcons({ className = "", iconClassName = "h-5 w-5" }: { className?: string; iconClassName?: string }) {
  const links = useSocialLinks();
  const networks = SOCIAL_NETWORKS.filter((network) => links[network.id]);
  if (networks.length === 0) return null;
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {networks.map((network) => {
        const Icon = ICONS[network.id];
        return (
          <a
            key={network.id}
            href={links[network.id]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ulô on ${network.label}`}
            className="text-gray-900 transition hover:opacity-70"
          >
            <Icon className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
}
