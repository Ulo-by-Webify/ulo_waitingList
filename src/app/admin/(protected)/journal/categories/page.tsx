import { listCategories } from "@/lib/server/category-repo";
import CategoryManager from "@/components/admin/journal/CategoryManager";
import JournalSubnav from "@/components/admin/journal/JournalSubnav";
import { requireAdmin } from "@/lib/server/admin-guard";

export default async function JournalCategoriesPage() {
  await requireAdmin("journal");
  const categories = await listCategories();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Journal</h1>
        <p className="text-sm text-gray-500">
          Renaming a category updates all of its posts. Categories still in use can&apos;t be deleted.
        </p>
      </div>
      <JournalSubnav active="/admin/journal/categories" />
      <CategoryManager
        categories={categories.map(({ id, name, postCount }) => ({ id, name, postCount }))}
      />
    </div>
  );
}
