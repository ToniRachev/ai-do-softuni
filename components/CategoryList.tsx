"use client";

import Link from "next/link";
import { deleteCategory } from "@/app/actions/categories";
import type { CategoryWithCount } from "@/lib/categories-query";
import { useConfirm } from "./useConfirm";

type CategoryListProps = {
  categories: CategoryWithCount[];
};

function CategoryCard({ category }: { category: CategoryWithCount }) {
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete category",
      message: `Delete "${category.name}"? Tasks in this category will be unassigned.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    await deleteCategory(category.id);
  }

  return (
    <>
      {dialog}
      <li className="group rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-teal-200/80 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/categories/${category.id}`}
            className="font-medium text-zinc-900 transition hover:text-teal-600"
          >
            {category.name}
          </Link>
          <p className="mt-2 text-xs text-zinc-400">
            {category.taskCount} {category.taskCount === 1 ? "task" : "tasks"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="shrink-0 rounded-lg px-2.5 py-1 text-sm text-red-600 opacity-70 transition hover:bg-red-50 group-hover:opacity-100"
        >
          Delete
        </button>
      </div>
    </li>
    </>
  );
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
        <p className="text-zinc-500">No categories yet.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Create one when adding a task on the Tasks page.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </ul>
  );
}
