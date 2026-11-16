import type { DashboardStats } from "@/lib/server/waitlist-repo";
import { USER_TYPES, USER_TYPE_LABELS } from "@/lib/validation";

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function StatCards({ stats }: { stats: DashboardStats }) {
  const topCountry = stats.topCountries[0];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Waitlist signups" value={stats.totalSignups} hint={`+${stats.last7Days} in the last 7 days`} />
        <Card label="Newsletter" value={stats.subscribers} hint="subscribers" />
        <Card
          label="Top country"
          value={topCountry?.country ?? "—"}
          hint={topCountry ? `${topCountry.count} signups` : undefined}
        />
        <Card label="Hosts" value={stats.byType.host} hint="want to host their home" />
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Signups by type</p>
        <div className="mt-3 space-y-2">
          {USER_TYPES.map((type) => {
            const count = stats.byType[type];
            const pct = stats.totalSignups ? Math.round((count / stats.totalSignups) * 100) : 0;
            return (
              <div key={type} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-gray-600">{USER_TYPE_LABELS[type]}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 text-right tabular-nums text-gray-900">
                  {count} <span className="text-gray-400">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
