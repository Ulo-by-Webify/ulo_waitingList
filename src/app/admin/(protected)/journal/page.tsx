import Link from "next/link";
import { format, parseISO } from "date-fns";
import { PlusIcon, StarIcon } from "@heroicons/react/24/solid";
import { DocumentTextIcon, FunnelIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/admin/EmptyState";
import CoverImage from "@/components/journal/CoverImage";
import { toolbarInputClass } from "@/components/admin/toolbar";
import {
  MAX_HERO_SLIDES,
  POST_STATUSES,
  isFeatured,
  type PostStatus,
} from "@/lib/journal";
import { listPosts } from "@/lib/server/journal-repo";
import DeleteButton from "@/components/admin/DeleteButton";
import JournalSubnav from "@/components/admin/journal/JournalSubnav";
import { requireAdmin } from "@/lib/server/admin-guard";

type SearchParams = { status?: string; q?: string };

const thClass =
  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";
const tdClass = "px-4 py-3 text-sm text-gray-900";

function PostsEmptyState({ isFiltered }: { isFiltered: boolean }) {
  return isFiltered ? (
    <EmptyState
      icon={FunnelIcon}
      title="No posts match these filters"
      description="Try a different search or status."
      action={
        <Link
          href="/admin/journal"
          className="text-sm font-medium text-gray-900 underline underline-offset-4"
        >
          Clear filters
        </Link>
      }
    />
  ) : (
    <EmptyState
      icon={DocumentTextIcon}
      title="No journal posts yet"
      description="Write your first story. Tag it “featured” to show it in the journal hero slider."
      action={
        <Link
          href="/admin/journal/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" /> New post
        </Link>
      }
    />
  );
}

export default async function JournalAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("journal");
  const status = POST_STATUSES.includes(searchParams.status as PostStatus)
    ? (searchParams.status as PostStatus)
    : undefined;
  const q = searchParams.q?.trim().slice(0, 100) || undefined;
  const posts = await listPosts({ status, search: q });
  const allPosts = status || q ? await listPosts() : posts;

  const heroCount = allPosts.filter(
    (p) => p.status === "published" && isFeatured(p.tags) && p.coverImage,
  ).length;
  const counts = {
    all: allPosts.length,
    published: allPosts.filter((p) => p.status === "published").length,
    draft: allPosts.filter((p) => p.status === "draft").length,
  };
  const tabs: { label: string; value?: PostStatus; count: number }[] = [
    { label: "All", count: counts.all },
    { label: "Published", value: "published", count: counts.published },
    { label: "Drafts", value: "draft", count: counts.draft },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Journal</h1>
          <p className="text-sm text-gray-500">
            {heroCount === 0
              ? "No posts in the hero slider. Tag a published post “featured” to add it."
              : `${Math.min(heroCount, MAX_HERO_SLIDES)} featured post${heroCount === 1 ? "" : "s"} in the hero slider${
                  heroCount > MAX_HERO_SLIDES
                    ? ` (newest ${MAX_HERO_SLIDES} shown)`
                    : ""
                }.`}
          </p>
        </div>
        <Link
          href="/admin/journal/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" /> New post
        </Link>
      </div>

      <JournalSubnav active="/admin/journal" />

      {counts.all > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Filter by status"
            className="flex gap-1 rounded-full border border-gray-200 bg-white p-1"
          >
            {tabs.map((tab) => {
              const active = tab.value === status;
              const href = `/admin/journal${tab.value || q ? `?${new URLSearchParams({ ...(tab.value ? { status: tab.value } : {}), ...(q ? { q } : {}) })}` : ""}`;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1 text-sm transition ${active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {tab.label}{" "}
                  <span className="tabular-nums opacity-70">{tab.count}</span>
                </Link>
              );
            })}
          </nav>
          <form action="/admin/journal" className="flex gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search title, category, author"
              aria-label="Search posts"
              className={`${toolbarInputClass} w-72`}
            />
          </form>
        </div>
      )}

      {posts.length === 0 ? (
        <PostsEmptyState isFiltered={Boolean(status || q)} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className={thClass}>Post</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => {
                const featured = isFeatured(post.tags);
                const date = post.publishedAt ?? post.updatedAt;
                return (
                  <tr key={post.id} className="hover:bg-gray-50/60">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <CoverImage
                            src={post.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/journal/${post.id}`}
                            className="line-clamp-1 font-medium hover:underline"
                          >
                            {post.title}
                          </Link>
                          <p className="line-clamp-1 text-xs text-gray-500">
                            {post.authorName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                        {featured && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                            title="Tagged featured"
                          >
                            <StarIcon className="h-3 w-3" aria-hidden="true" />{" "}
                            Hero
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`${tdClass} text-gray-600`}>
                      {post.category}
                    </td>
                    <td
                      className={`${tdClass} whitespace-nowrap text-gray-600`}
                    >
                      {post.publishedAt ? "" : "Edited "}
                      {format(parseISO(date), "d MMM yyyy")}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right`}>
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/journal/${post.id}`}
                          className="text-xs font-medium text-gray-900 hover:underline"
                        >
                          Edit
                        </Link>
                        {post.status === "published" && (
                          <a
                            href={`/journal/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-gray-900 hover:underline"
                          >
                            View
                          </a>
                        )}
                        <DeleteButton
                          endpoint={`/api/admin/journal/${post.id}`}
                          label={`“${post.title}”`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
