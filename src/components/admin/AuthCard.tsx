/** Shared shell for the signed-out admin pages (login, forgot/reset password, invites). */
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center gap-8 px-4 py-10">
      <img src="/logo-dark.png" alt="Ulô Africa" width={973} height={638} className="h-auto w-[110px]" />
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="text-center text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
