"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteProject, updateProject } from "@/app/actions/projects";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/schema";
import { ProjectForm } from "./ProjectForm";
import { useConfirm } from "./useConfirm";

type ProjectDetailHeaderProps = {
  project: Project;
};

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const router = useRouter();
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
    router.push("/projects");
  }

  if (editing) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <ProjectForm
          action={boundUpdate}
          project={project}
          submitLabel="Save changes"
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <>
      {dialog}
      <header className="mb-8">
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-violet-600"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        All projects
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-2 max-w-2xl text-zinc-500">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
