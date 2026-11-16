import { formatDistanceToNow } from "date-fns";
import { requireAdmin } from "@/lib/server/admin-guard";
import { getHomeContentForAdmin } from "@/lib/server/home-repo";
import { isStorageConfigured } from "@/lib/server/storage";
import { can } from "@/lib/permissions";
import HomeEditor from "@/components/admin/home/HomeEditor";

export const metadata = { title: "Home" };

export default async function HomeAdminPage() {
  const { admin } = await requireAdmin("site");
  const { content, isCustom, updatedAt } = await getHomeContentForAdmin();
  const canUpload = can(admin.role, "media") && isStorageConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
        <p className="text-sm text-gray-500">
          Edit the text and images of every homepage section. Videos stay as they are. Nothing changes on the site until you press Save changes.
        </p>
      </div>

      {!isStorageConfigured() && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The storage bucket isn&apos;t set up, so you can&apos;t upload images here yet. You can still use a link to an image.
        </p>
      )}

      <HomeEditor
        initial={content}
        isCustom={isCustom}
        updatedLabel={updatedAt ? `saved ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}` : null}
        canUpload={canUpload}
      />
    </div>
  );
}
