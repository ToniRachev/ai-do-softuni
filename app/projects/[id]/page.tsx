import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

import { createTask } from "@/app/actions/tasks";
import { ProjectDetailHeader } from "@/components/ProjectDetailHeader";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { db } from "@/lib/db";
import { categories, projects } from "@/lib/schema";
import { getTasksWithMeta, sortTasksByStatus } from "@/lib/tasks-query";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
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
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Project tasks
          </h2>
          <TaskList
            tasks={sortedTasks}
            projects={allProjects}
            categories={allCategories}
            emptyMessage={`No tasks in "${project.name}".`}
          />
        </section>
      </div>
    </div>
  );
}
