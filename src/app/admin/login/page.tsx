import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";
import AuthCard from "@/components/admin/AuthCard";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminLoginPage() {
  return (
    <AuthCard title="Admin sign in" subtitle="Welcome back. Sign in to continue.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
