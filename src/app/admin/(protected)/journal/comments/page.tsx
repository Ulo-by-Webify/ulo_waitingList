import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChatBubbleLeftRightIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { COMMENT_STATUSES, type CommentStatus } from "@/lib/journal";
import { countComments, listAdminComments } from "@/lib/server/engagement-repo";
import { requireAdmin } from "@/lib/server/admin-guard";
import JournalSubnav from "@/components/admin/journal/JournalSubnav";
import CommentsTable, { type CommentRow } from "@/components/admin/journal/CommentsTable";
import EmptyState from "@/components/admin/EmptyState";
import { toolbarInputClass, toolbarPrimaryButtonClass } from "@/components/admin/toolbar";

type SearchParams = { status?: string; q?: string };

export default async function JournalCommentsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin("journal");
  const status = COMMENT_STATUSES.includes(searchParams.status as CommentStatus)
    ? (searchParams.status as CommentStatus)
    : undefined;
  const q = searchParams.q?.trim().slice(0, 100) || undefined;
  const [comments, counts] = await Promise.all([listAdminComments({ status, search: q }), countComments()]);

  const rows: CommentRow[] = comments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    body: c.body,
    status: c.status,
    postTitle: c.postTitle,
    postSlug: c.postSlug,
    postedAt: formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }),
  }));

  const filters = [
    { label: "All", value: undefined, count: counts.all },
    { label: "Visible", value: "visible", count: counts.visible },
    { label: "Hidden", value: "hidden", count: counts.hidden },
  ] as const;
  const href = (value?: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    const query = params.toString();
    return `/admin/journal/comments${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Journal</h1>
        <p className="text-sm text-gray-500">
          Comments appear on the site straight away. Hide any you don&apos;t want shown, or delete them for good.
        </p>
      </div>
      <JournalSubnav active="/admin/journal/comments" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter comments" className="flex gap-1 rounded-full border border-gray-200 bg-white p-1">
          {filters.map((f) => {
            const isActive = status === f.value;
            return (
              <Link
                key={f.label}
                href={href(f.value)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-1 text-sm transition ${isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {f.label} <span className={isActive ? "text-white/70" : "text-gray-400"}>{f.count}</span>
              </Link>
            );
          })}
        </nav>
        <form action="/admin/journal/comments" className="flex flex-wrap gap-3">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search comments, names or posts"
            aria-label="Search comments"
            className={`${toolbarInputClass} min-w-[260px]`}
          />
          <button className={toolbarPrimaryButtonClass}>Search</button>
        </form>
      </div>

      {rows.length === 0 ? (
        status || q ? (
          <EmptyState
            icon={FunnelIcon}
            title="No comments match"
            description="Try a different search or filter."
            action={
              <Link href="/admin/journal/comments" className="text-sm font-medium text-gray-900 underline underline-offset-4">
                Clear filters
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={ChatBubbleLeftRightIcon}
            title="No comments yet"
            description="When readers comment on your journal posts, their comments will appear here."
          />
        )
      ) : (
        <CommentsTable comments={rows} />
      )}
    </div>
  );
}
