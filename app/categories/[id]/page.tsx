import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { createTask } from "@/app/actions/tasks";
import { CategoryDetailHeader } from "@/components/CategoryDetailHeader";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TaskViewTabs } from "@/components/TaskViewTabs";
import { db } from "@/lib/db";
import { categories, projects } from "@/lib/schema";
import {
  filterTasksByView,
  getEmptyMessageForView,
  parseTaskViewParam,
} from "@/lib/task-view";
import { getTasksWithMeta, sortTasksByStatus } from "@/lib/tasks-query";

type CategoryDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const { view: viewParam } = await searchParams;
  const viewMode = parseTaskViewParam(viewParam);
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
  const filteredTasks = filterTasksByView(sortedTasks, viewMode);
  const emptyMessage = getEmptyMessageForView(viewMode, {
    scopeName: category.name,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CategoryDetailHeader category={category} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            New task
          </h2>
          <TaskForm
            action={createTask}
            projects={allProjects}
            categories={allCategories}
            defaultCategoryId={category.id}
            submitLabel="Add task"
          />
        </section>

        <section className="glass-card min-h-[320px] rounded-2xl p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              Category tasks
            </h2>
            <TaskViewTabs />
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
