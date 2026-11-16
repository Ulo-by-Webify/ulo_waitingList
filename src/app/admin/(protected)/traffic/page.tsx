import { format, parseISO } from "date-fns";
import { getTrafficSummary } from "@/lib/server/traffic-repo";
import {
  formatPeriod,
  resolvePeriod,
  type TrafficPeriod,
} from "@/lib/traffic-period";
import TrafficRangePicker from "@/components/admin/TrafficRangePicker";
import TrafficChart from "@/components/admin/TrafficChart";
import BarList from "@/components/admin/BarList";
import { requireAdmin } from "@/lib/server/admin-guard";
import EmptyState from "@/components/admin/EmptyState";
import {
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  GlobeEuropeAfricaIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryLabel(code: string): string {
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/** "in the last 30 days" for presets, "from 3 Mar – 18 Mar 2026" for custom ranges. */
function describePeriod(period: TrafficPeriod): string {
  return period.preset
    ? `in the last ${period.preset} days`
    : `from ${formatPeriod(period)}`;
}

export default async function TrafficPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  await requireAdmin("traffic");
  const period = resolvePeriod(searchParams);
  const periodLabel = describePeriod(period);
  const t = await getTrafficSummary(period);
  const conversion = t.visitors
    ? ((t.signups / t.visitors) * 100).toFixed(1)
    : "0.0";
  const viewsPerVisitor = t.visitors
    ? (t.pageviews / t.visitors).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Traffic</h1>
          <p className="text-sm text-gray-500">
            Cookieless page-view analytics for the public site. Times in UTC.
          </p>
        </div>
        <TrafficRangePicker period={period} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Visitors" value={t.visitors} hint={periodLabel} />
        <Stat
          label="Page views"
          value={t.pageviews}
          hint={`${viewsPerVisitor} per visitor`}
        />
        <Stat label="Visitors today" value={t.visitorsToday} />
        <Stat
          label="Signup rate"
          value={`${conversion}%`}
          hint={`${t.signups} waitlist signups`}
        />
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">
          Visitors per day
        </h2>
        {t.pageviews === 0 ? (
          <EmptyState
            variant="plain"
            icon={ChartBarIcon}
            title={`No visits ${periodLabel}`}
            description="Page views from the public site will appear here as soon as people start visiting."
          />
        ) : (
          <>
            <div className="mt-4">
              <TrafficChart data={t.daily} />
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-900">
                View as table
              </summary>
              <div className="mt-2 max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-1 font-medium">Day</th>
                      <th className="py-1 text-right font-medium">Visitors</th>
                      <th className="py-1 text-right font-medium">
                        Page views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {[...t.daily].reverse().map((d) => (
                      <tr key={d.day} className="border-t border-gray-100">
                        <td className="py-1">
                          {format(parseISO(d.day), "EEE d MMM")}
                        </td>
                        <td className="py-1 text-right">{d.visitors}</td>
                        <td className="py-1 text-right">{d.pageviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarList
          title="Top pages"
          rows={t.topPages}
          emptyIcon={DocumentTextIcon}
        />
        <BarList
          title="Referrers"
          rows={t.referrers}
          emptyIcon={ArrowTopRightOnSquareIcon}
          emptyText="No visits from other websites yet."
        />
        <BarList
          title="Campaigns (utm_source)"
          rows={t.sources}
          emptyIcon={MegaphoneIcon}
          emptyText="Links tagged with utm_source will show up here."
        />
        <BarList
          title="Countries"
          rows={t.countries}
          formatLabel={countryLabel}
          emptyIcon={GlobeEuropeAfricaIcon}
          emptyText="Country data needs a CDN that sends geo headers (e.g. Cloudflare)."
        />
        <BarList
          title="Devices"
          rows={t.devices}
          formatLabel={(d) => DEVICE_LABELS[d] ?? d}
          emptyIcon={ComputerDesktopIcon}
        />
        <BarList title="Browsers" rows={t.browsers} emptyIcon={GlobeAltIcon} />
      </div>
    </div>
  );
}
