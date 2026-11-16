import { DEFAULT_AUTHOR } from "@/lib/journal";
import { listCategories } from "@/lib/server/category-repo";
import PostEditor from "@/components/admin/journal/PostEditor";
import { requireAdmin } from "@/lib/server/admin-guard";

export default async function NewJournalPostPage() {
  await requireAdmin("journal");
  const categories = await listCategories();
  return (
    <PostEditor
      categories={categories.map((c) => c.name)}
      initial={{
        id: null,
        title: "",
        slug: "",
        excerpt: "",
        coverImage: "",
        category: "",
        authorName: DEFAULT_AUTHOR,
        tags: [],
        content: [],
        status: "draft",
        publishedAt: null,
      }}
    />
  );
}
