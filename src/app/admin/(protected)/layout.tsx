import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/admin-guard";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin } = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <AdminNav displayName={admin.fullName || admin.email} role={admin.role} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
