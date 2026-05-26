"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ActionState } from "@/app/actions/tasks";
import { TaskForm } from "@/components/TaskForm";
import type { Category, Project } from "@/lib/schema";

type TaskFormModalProps = {
  action: (
    prev: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  projects: Project[];
  categories: Category[];
  defaultProjectId?: number;
  defaultCategoryId?: number;
  triggerLabel?: string;
};

export function TaskFormModal({
  action,
  projects,
  categories,
  defaultProjectId,
  defaultCategoryId,
  triggerLabel = "+ New Task",
}: TaskFormModalProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleClose = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-linear-to-r from-violet-500 to-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]"
            onClick={handleClose}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="glass-card relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
          >
            <h2 id={titleId} className="text-lg font-semibold text-zinc-900 mb-4">
              Create New Task
            </h2>
            <TaskForm
              action={action}
              projects={projects}
              categories={categories}
              defaultProjectId={defaultProjectId}
              defaultCategoryId={defaultCategoryId}
              submitLabel="Create Task"
              onSuccess={handleClose}
              onCancel={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
}
