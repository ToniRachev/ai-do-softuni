import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { createTask } from "@/app/actions/tasks";
import { TaskFormModal } from "@/components/TaskFormModal";
import { TaskList } from "@/components/TaskList";
import { TaskViewTabs } from "@/components/TaskViewTabs";
import { TaskFilters } from "@/components/TaskFilters";
import { StatisticsCard } from "@/components/StatisticsCard";
import { CompletionChart } from "@/components/CompletionChart";
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
import { getCompletedTasksByDay, getGlobalCompletionStats } from "@/lib/statistics-query";

type HomeProps = {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const viewParam = typeof params.view === "string" ? params.view : undefined;
  const viewMode = parseTaskViewParam(viewParam);
  
  // Parse advanced filters
  const filters = parseTaskFiltersFromParams(params);
  
  const [allProjects, allCategories, allTasks, completionByDay, globalStats] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.name)),
    db.select().from(categories).orderBy(asc(categories.name)),
    getTasksWithMeta(),
    getCompletedTasksByDay(),
    getGlobalCompletionStats(),
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

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start">
        {/* Tasks Section - Left Column */}
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

        {/* Statistics Section - Right Column */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
              Productivity Statistics
            </h2>
            <StatisticsCard stats={globalStats} />
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
              Completed Tasks (Last 30 Days)
            </h3>
            <CompletionChart data={completionByDay} />
          </div>
        </section>
      </div>
    </div>
  );
}
