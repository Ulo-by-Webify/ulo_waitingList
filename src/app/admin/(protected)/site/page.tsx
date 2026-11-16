import { formatDistanceToNow } from "date-fns";
import { requireAdmin } from "@/lib/server/admin-guard";
import { getSocialLinksForAdmin, listSiteImages } from "@/lib/server/settings-repo";
import { isStorageConfigured } from "@/lib/server/storage";
import { can } from "@/lib/permissions";
import SiteImageCard from "@/components/admin/site/SiteImageCard";
import SocialLinksForm from "@/components/admin/site/SocialLinksForm";
import CollapsibleSection from "@/components/admin/CollapsibleSection";
import { SITE_IMAGES } from "@/lib/site-settings";
import { SOCIAL_NETWORKS } from "@/lib/social-links";

export default async function SitePage() {
  const { admin } = await requireAdmin("site");
  const [images, socialLinks] = await Promise.all([listSiteImages(), getSocialLinksForAdmin()]);
  const canUpload = can(admin.role, "media") && isStorageConfigured();
  const socialCount = SOCIAL_NETWORKS.filter((n) => socialLinks[n.id]).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Site</h1>
        <p className="text-sm text-gray-500">Change images and social links on the public site. Changes go live straight away.</p>
      </div>

      {!isStorageConfigured() && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The storage bucket isn&apos;t set up, so you can&apos;t upload images here yet. You can still use a link to an image.
        </p>
      )}

      <CollapsibleSection
        storageKey="site:social"
        title="Social media links"
        description="Shown in the site footer and on the “You’re in early” screen after someone joins the waitlist."
        badge={{
          label: `${socialCount} of ${SOCIAL_NETWORKS.length} shown`,
          tone: socialCount ? "success" : "warning",
        }}
      >
        <SocialLinksForm initial={socialLinks} />
      </CollapsibleSection>

      <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Images</h2>
      {images.map((image) => (
        <CollapsibleSection
          key={image.key}
          storageKey={`site:image:${image.key}`}
          title={SITE_IMAGES[image.key].label}
          description={SITE_IMAGES[image.key].description}
          badge={image.isCustom ? { label: "Custom image", tone: "success" } : { label: "Original image" }}
        >
          <SiteImageCard
            imageKey={image.key}
            url={image.url}
            isCustom={image.isCustom}
            updatedLabel={image.updatedAt ? formatDistanceToNow(new Date(image.updatedAt), { addSuffix: true }) : null}
            canUpload={canUpload}
          />
        </CollapsibleSection>
      ))}
    </div>
  );
}
