import { requireAdmin } from "@/lib/server/admin-guard";
import ProfileForm from "@/components/admin/ProfileForm";
import AccountSection, { formatAccountDate } from "@/components/admin/AccountSection";

export default async function ProfilePage() {
  const { admin } = await requireAdmin();

  return (
    <AccountSection title="Profile" description="Your name and the email you sign in with.">
      <ProfileForm initialFullName={admin.fullName ?? ""} initialEmail={admin.email} />
      <dl className="mt-6 grid gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Admin since</dt>
          <dd className="text-gray-900">{formatAccountDate(admin.createdAt, "—")}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Last sign in</dt>
          <dd className="text-gray-900">{formatAccountDate(admin.lastLoginAt, "—")}</dd>
        </div>
      </dl>
    </AccountSection>
  );
}
