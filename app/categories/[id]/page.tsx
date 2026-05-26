import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { createTask } from "@/app/actions/tasks";
import { CategoryDetailHeader } from "@/components/CategoryDetailHeader";
import { TaskFormModal } from "@/components/TaskFormModal";
import { TaskList } from "@/components/TaskList";
import { TaskViewTabs } from "@/components/TaskViewTabs";
import { TaskFilters } from "@/components/TaskFilters";
import { db } from "@/lib/db";
import { categories, projects } from "@/lib/schema";
import {
  filterTasksByView,
  getEmptyMessageForView,
  parseTaskViewParam,
  applyAdvancedFilters,
  parseTaskFiltersFromParams,
} from "@/lib/task-view";
import { getTasksWithMeta, sortTasksByStatus } from "@/lib/tasks-query";

type CategoryDetailPageProps = {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const searchParamsObj = await searchParams;
  const viewParam = typeof searchParamsObj.view === "string" ? searchParamsObj.view : undefined;
  const viewMode = parseTaskViewParam(viewParam);
  
  // Parse advanced filters
  const filters = parseTaskFiltersFromParams(searchParamsObj);
  
  const { id: idParam } = await params;
  const categoryId = Number(idParam);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!category) {
    notFound();
  }

  const [allProjects, allCategories, categoryTasks] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.name)),
    db.select().from(categories).orderBy(asc(categories.name)),
    getTasksWithMeta({ categoryId }),
  ]);

  const sortedTasks = sortTasksByStatus(categoryTasks);
  const viewFilteredTasks = filterTasksByView(sortedTasks, viewMode);
  const filteredTasks = applyAdvancedFilters(viewFilteredTasks, filters);
  const emptyMessage = getEmptyMessageForView(viewMode, {
    scopeName: category.name,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CategoryDetailHeader category={category} />

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start">
        <section className="glass-card min-h-80 rounded-2xl p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              Category tasks
            </h2>
            <div className="flex items-center gap-3">
              <TaskViewTabs />
              <TaskFormModal
                action={createTask}
                projects={allProjects}
                categories={allCategories}
                defaultCategoryId={category.id}
                triggerLabel="+ New Task"
              />
            </div>
          </div>
          <div className="mb-6">
            <TaskFilters />
          </div>
          <TaskList
            tasks={filteredTasks}
            view={viewMode}
            projects={allProjects}
            categories={allCategories}
            emptyMessage={emptyMessage}
          />
        </section>
      </div>
    </div>
  );
}
