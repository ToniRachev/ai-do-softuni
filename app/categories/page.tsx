export const dynamic = "force-dynamic";

import { CategoryList } from "@/components/CategoryList";
import { getCategoriesWithCounts } from "@/lib/categories-query";

export default async function CategoriesPage() {
  const categoryList = await getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Categories
        </h1>
        <p className="mt-2 text-zinc-500">
          Browse categories and open one to see its tasks. Create categories when
          adding or editing a task.
        </p>
      </header>

      <section className="glass-card min-h-[320px] rounded-2xl p-6">
        <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Your categories
        </h2>
        <CategoryList categories={categoryList} />
      </section>
    </div>
  );
}
