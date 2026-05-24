"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/app/actions/projects";
import type { Project } from "@/lib/schema";

const initialState: ActionState = { success: false };

const inputClassName =
  "w-full rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

type ProjectFormProps = {
  action: (
    prev: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  project?: Project;
  submitLabel: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ProjectForm({
  action,
  project,
  submitLabel,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      if (!project) formRef.current?.reset();
      onSuccess?.();
    }
  }, [state.success, onSuccess, project]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={project?.name ?? ""}
          placeholder="Project name"
          className={inputClassName}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Description
          <span className="ml-1 font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={project?.description ?? ""}
          placeholder="What is this project about?"
          className={`${inputClassName} resize-y`}
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
