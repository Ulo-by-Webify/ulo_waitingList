import type { Metadata } from "next";
import AuthCard from "@/components/admin/AuthCard";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot password" subtitle="We'll email you a link to choose a new one.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
