import { notFound } from "next/navigation";
import { getPostById } from "@/lib/server/journal-repo";
import { listCategories } from "@/lib/server/category-repo";
import PostEditor from "@/components/admin/journal/PostEditor";
import { isUuid } from "@/lib/ids";
import { requireAdmin } from "@/lib/server/admin-guard";

export default async function EditJournalPostPage({ params }: { params: { id: string } }) {
  await requireAdmin("journal");
  if (!isUuid(params.id)) notFound();
  const [post, categories] = await Promise.all([getPostById(params.id), listCategories()]);
  if (!post) notFound();

  return (
    <PostEditor
      // Remount when switching posts so editor state never leaks between them.
      key={post.id}
      categories={categories.map((c) => c.name)}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage ?? "",
        category: post.category,
        authorName: post.authorName,
        tags: post.tags,
        content: post.content,
        status: post.status,
        publishedAt: post.publishedAt,
      }}
    />
  );
}
