import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { createTask } from "@/app/actions/tasks";
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

type HomeProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { view: viewParam } = await searchParams;
  const viewMode = parseTaskViewParam(viewParam);
  const [allProjects, allCategories, allTasks] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.name)),
    db.select().from(categories).orderBy(asc(categories.name)),
    getTasksWithMeta(),
  ]);
  const sortedTasks = sortTasksByStatus(allTasks);
  const filteredTasks = filterTasksByView(sortedTasks, viewMode);
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            New task
          </h2>
          <TaskForm
            action={createTask}
            projects={allProjects}
            categories={allCategories}
            submitLabel="Add task"
          />
        </section>

        <section className="glass-card min-h-[320px] rounded-2xl p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              Your tasks
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
