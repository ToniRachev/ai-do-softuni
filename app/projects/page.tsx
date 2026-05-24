export const dynamic = "force-dynamic";

import { createProject } from "@/app/actions/projects";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectList } from "@/components/ProjectList";
import { getProjectsWithCounts } from "@/lib/projects-query";

export default async function ProjectsPage() {
  const projectList = await getProjectsWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Projects
        </h1>
        <p className="mt-2 text-zinc-500">
          Group related tasks into projects and open a project to see its tasks.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            New project
          </h2>
          <ProjectForm action={createProject} submitLabel="Add project" />
        </section>

        <section className="glass-card min-h-[320px] rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Your projects
          </h2>
          <ProjectList projects={projectList} />
        </section>
      </div>
    </div>
  );
}
