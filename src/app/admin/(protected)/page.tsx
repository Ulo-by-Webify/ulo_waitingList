import Link from "next/link";
import { format } from "date-fns";
import { USER_TYPES, USER_TYPE_LABELS, type UserType } from "@/lib/validation";
import {
  getDashboardStats,
  listSignups,
  listSubscribers,
} from "@/lib/server/waitlist-repo";
import StatCards from "@/components/admin/StatCards";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import { requireAdmin } from "@/lib/server/admin-guard";
import ToolbarSelect from "@/components/admin/ToolbarSelect";
import {
  toolbarInputClass,
  toolbarPrimaryButtonClass,
  toolbarSecondaryButtonClass,
} from "@/components/admin/toolbar";
import EmptyState from "@/components/admin/EmptyState";
import {
  EnvelopeIcon,
  FunnelIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

type SearchParams = { tab?: string; q?: string; type?: string; page?: string };

const thClass =
  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";
const tdClass = "px-4 py-3 text-sm text-gray-900";

function formatDate(iso: string) {
  return format(new Date(iso), "d MMM yyyy, HH:mm");
}

function query(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter((e): e is [string, string] =>
    Boolean(e[1]),
  );
  return entries.length ? `?${new URLSearchParams(entries)}` : "";
}

async function WaitlistTable({
  q,
  type,
  page,
}: {
  q?: string;
  type?: UserType;
  page: number;
}) {
  const result = await listSignups({ search: q, userType: type, page });
  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-center gap-3" action="/admin">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, country"
          aria-label="Search signups"
          className={`${toolbarInputClass} min-w-[240px] flex-1`}
        />
        <ToolbarSelect
          name="type"
          defaultValue={type ?? ""}
          aria-label="Filter by type"
          className="w-44"
        >
          <option value="">All types</option>
          {USER_TYPES.map((t) => (
            <option key={t} value={t}>
              {USER_TYPE_LABELS[t]}
            </option>
          ))}
        </ToolbarSelect>
        <button className={toolbarPrimaryButtonClass}>
          Filter
        </button>
        <a
          href={`/api/admin/export${query({ q, type })}`}
          className={toolbarSecondaryButtonClass}
        >
          Export CSV
        </a>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Country</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Joined</th>
              <th className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  {q || type ? (
                    <EmptyState
                      variant="plain"
                      icon={FunnelIcon}
                      title="No signups match these filters"
                      description="Try a different search or type."
                      action={
                        <Link
                          href="/admin"
                          className="text-sm font-medium text-gray-900 underline underline-offset-4"
                        >
                          Clear filters
                        </Link>
                      }
                    />
                  ) : (
                    <EmptyState
                      variant="plain"
                      icon={UserGroupIcon}
                      title="No signups yet"
                      description="People who join the early-access waitlist on the site will appear here."
                    />
                  )}
                </td>
              </tr>
            )}
            {result.rows.map((s) => (
              <tr key={s.id}>
                <td className={tdClass}>{s.fullName}</td>
                <td className={tdClass}>
                  <a href={`mailto:${s.email}`} className="hover:underline">
                    {s.email}
                  </a>
                </td>
                <td className={tdClass}>{s.country}</td>
                <td className={tdClass}>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs">
                    {USER_TYPE_LABELS[s.userType]}
                  </span>
                </td>
                <td className={`${tdClass} whitespace-nowrap text-gray-600`}>
                  {formatDate(s.createdAt)}
                </td>
                <td className={`${tdClass} text-right`}>
                  <DeleteButton
                    endpoint={`/api/admin/signups/${s.id}`}
                    label={s.email}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        buildHref={(p) => `/admin${query({ q, type, page: String(p) })}`}
      />
    </div>
  );
}

async function NewsletterTable({ page }: { page: number }) {
  const result = await listSubscribers(page);
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <a
          href="/api/admin/export?dataset=newsletter"
          className={toolbarSecondaryButtonClass}
        >
          Export CSV
        </a>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className={thClass}>Email</th>
              <th className={thClass}>Subscribed</th>
              <th className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <EmptyState
                    variant="plain"
                    icon={EnvelopeIcon}
                    title="No subscribers yet"
                    description="Anyone who subscribes to the newsletter on the site will appear here."
                  />
                </td>
              </tr>
            )}
            {result.rows.map((s) => (
              <tr key={s.id}>
                <td className={tdClass}>{s.email}</td>
                <td className={`${tdClass} text-gray-600`}>
                  {formatDate(s.createdAt)}
                </td>
                <td className={`${tdClass} text-right`}>
                  <DeleteButton
                    endpoint={`/api/admin/subscribers/${s.id}`}
                    label={s.email}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        buildHref={(p) =>
          `/admin${query({ tab: "newsletter", page: String(p) })}`
        }
      />
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("waitlist");
  const tab = searchParams.tab === "newsletter" ? "newsletter" : "waitlist";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const q = searchParams.q?.trim().slice(0, 100) || undefined;
  const type = USER_TYPES.includes(searchParams.type as UserType)
    ? (searchParams.type as UserType)
    : undefined;
  const stats = await getDashboardStats();

  const tabClass = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-medium ${active ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-900"}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Early-access signups and newsletter subscribers.
        </p>
      </div>

      <StatCards stats={stats} />

      <div className="space-y-4">
        <div className="flex gap-6 border-b border-gray-200">
          <Link href="/admin" className={tabClass(tab === "waitlist")}>
            Waitlist ({stats.totalSignups})
          </Link>
          <Link
            href="/admin?tab=newsletter"
            className={tabClass(tab === "newsletter")}
          >
            Newsletter ({stats.subscribers})
          </Link>
        </div>
        {tab === "waitlist" ? (
          <WaitlistTable q={q} type={type} page={page} />
        ) : (
          <NewsletterTable page={page} />
        )}
      </div>
    </div>
  );
}
