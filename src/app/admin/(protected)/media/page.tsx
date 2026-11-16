import { isStorageConfigured } from "@/lib/server/storage";
import MediaManager from "@/components/admin/MediaManager";
import { requireAdmin } from "@/lib/server/admin-guard";

export default async function AdminMediaPage() {
  await requireAdmin("media");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Media</h1>
        <p className="text-sm text-gray-500">
          Files stored in the Railway bucket. Copied links are public and permanent, so they can be used in journal posts.
        </p>
      </div>
      {isStorageConfigured() ? (
        <MediaManager />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          The storage bucket isn&apos;t configured yet. Add <code>BUCKET</code>, <code>ACCESS_KEY_ID</code>,{" "}
          <code>SECRET_ACCESS_KEY</code>, <code>REGION</code> and <code>ENDPOINT</code> from the Railway bucket&apos;s
          Credentials tab to your environment, then restart the app.
        </div>
      )}
    </div>
  );
}
