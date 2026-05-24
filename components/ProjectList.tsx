"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProject, updateProject } from "@/app/actions/projects";
import type { ProjectWithCount } from "@/lib/projects-query";
import { ProjectForm } from "./ProjectForm";
import { useConfirm } from "./useConfirm";

type ProjectListProps = {
  projects: ProjectWithCount[];
};

function ProjectCard({ project }: { project: ProjectWithCount }) {
  const [editing, setEditing] = useState(false);
  const { confirm, dialog } = useConfirm();
  const boundUpdate = updateProject.bind(null, project.id);

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete project",
      message: `Delete "${project.name}"? All tasks in this project will also be deleted.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    await deleteProject(project.id);
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <ProjectForm
          action={boundUpdate}
          project={project}
          submitLabel="Save changes"
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <>
      {dialog}
      <li className="group rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-violet-200/80 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/projects/${project.id}`}
            className="font-medium text-zinc-900 transition hover:text-violet-600"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
              {project.description}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-400">
            {project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}
          </p>
        </div>
        <div className="flex shrink-0 gap-1 opacity-70 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg px-2.5 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg px-2.5 py-1 text-sm text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
    </>
  );
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
        <p className="text-zinc-500">No projects yet.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Create one on the left to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </ul>
  );
}
