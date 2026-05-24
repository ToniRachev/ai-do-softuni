import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { createTask } from "@/app/actions/tasks";
import { ProjectDetailHeader } from "@/components/ProjectDetailHeader";
import { TaskForm } from "@/components/TaskForm";
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

type ProjectDetailPageProps = {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const searchParamsObj = await searchParams;
  const viewParam = typeof searchParamsObj.view === "string" ? searchParamsObj.view : undefined;
  const viewMode = parseTaskViewParam(viewParam);
  
  // Parse advanced filters
  const filters = parseTaskFiltersFromParams(searchParamsObj);
  
  const { id: idParam } = await params;
  const projectId = Number(idParam);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    notFound();
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    notFound();
  }

  const [allProjects, allCategories, projectTasks] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.name)),
    db.select().from(categories).orderBy(asc(categories.name)),
    getTasksWithMeta({ projectId }),
  ]);

  const sortedTasks = sortTasksByStatus(projectTasks);
  const viewFilteredTasks = filterTasksByView(sortedTasks, viewMode);
  const filteredTasks = applyAdvancedFilters(viewFilteredTasks, filters);
  const emptyMessage = getEmptyMessageForView(viewMode, {
    scopeName: project.name,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ProjectDetailHeader project={project} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            New task
          </h2>
          <TaskForm
            action={createTask}
            projects={allProjects}
            categories={allCategories}
            defaultProjectId={project.id}
            submitLabel="Add task"
          />
        </section>

        <section className="glass-card min-h-[320px] rounded-2xl p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              Project tasks
            </h2>
            <TaskViewTabs />
          </div>          <div className="mb-6">
            <TaskFilters />
          </div>          <TaskList
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
