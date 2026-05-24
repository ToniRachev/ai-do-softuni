"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/app/actions/categories";
import type { Category } from "@/lib/schema";
import { useConfirm } from "./useConfirm";

type CategoryDetailHeaderProps = {
  category: Category;
};

export function CategoryDetailHeader({ category }: CategoryDetailHeaderProps) {
  const router = useRouter();
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
    router.push("/categories");
  }

  return (
    <>
      {dialog}
      <header className="mb-8">
      <Link
        href="/categories"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-teal-600"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        All categories
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {category.name}
        </h1>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
        >
          Delete category
        </button>
      </div>
    </header>
    </>
  );
}
