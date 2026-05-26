import Link from "next/link";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { createTask } from "@/app/actions/tasks";
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

type HomeProps = {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const viewParam = typeof params.view === "string" ? params.view : undefined;
  const viewMode = parseTaskViewParam(viewParam);
  
  // Parse advanced filters
  const filters = parseTaskFiltersFromParams(params);
  
  const [allProjects, allCategories, allTasks] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.name)),
    db.select().from(categories).orderBy(asc(categories.name)),
    getTasksWithMeta(),
  ]);
  const sortedTasks = sortTasksByStatus(allTasks);
  const viewFilteredTasks = filterTasksByView(sortedTasks, viewMode);
  const filteredTasks = applyAdvancedFilters(viewFilteredTasks, filters);
  const emptyMessage = getEmptyMessageForView(viewMode);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Tasks
        </h1>
        <p className="mt-2 text-zinc-500">
          Organize your work with a simple, distraction-free list.
        </p>
      </header>

      <div className="mb-8 rounded-3xl border border-zinc-200/80 bg-zinc-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-600">
              Task overview
            </p>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Keep your task workflow focused here. For a full progress snapshot and deeper productivity metrics, go to the dedicated Stats page.
            </p>
          </div>
          <Link
            href="/stats"
            className="inline-flex items-center rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            View full stats
          </Link>
        </div>
      </div>

      <section className="glass-card min-h-80 rounded-2xl p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Your tasks
          </h2>
          <div className="flex items-center gap-3">
            <TaskViewTabs />
            <TaskFormModal
              action={createTask}
              projects={allProjects}
              categories={allCategories}
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
  );
}
