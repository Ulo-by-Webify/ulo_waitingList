import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/admin/AuthCard";
import SetPasswordForm from "@/components/admin/SetPasswordForm";
import { peekToken } from "@/lib/server/token-repo";

export const metadata: Metadata = {
  title: "Set password",
  // Keep the token out of Referer headers sent to any other origin.
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

type SearchParams = { token?: string; purpose?: string };

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const purpose = searchParams.purpose === "invite" ? "invite" : "reset";
  const token = searchParams.token ?? "";
  const target = token ? await peekToken(token, purpose) : null;
  const isInvite = purpose === "invite";

  if (!target) {
    return (
      <AuthCard title="Link expired" subtitle="This link is invalid, has expired or was already used.">
        <div className="mt-6 space-y-3 text-center text-sm">
          <p className="text-gray-600">
            {isInvite ? "Ask the owner who invited you to send a new invite." : "Request a new reset link and use it within 30 minutes."}
          </p>
          <Link
            href={isInvite ? "/admin/login" : "/admin/forgot-password"}
            className="inline-block font-medium text-gray-900 underline underline-offset-4"
          >
            {isInvite ? "Go to sign in" : "Request a new link"}
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={isInvite ? "Welcome to Ulô Admin" : "Choose a new password"}
      subtitle={isInvite ? "Set a password to finish creating your account." : "This also signs you out on every device."}
    >
      <SetPasswordForm token={token} purpose={purpose} email={target.email} />
    </AuthCard>
  );
}
