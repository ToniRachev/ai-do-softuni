"use client";

import { useState } from "react";
import { deleteTask, toggleTaskStatus, updateTask } from "@/app/actions/tasks";
import type { Task } from "@/lib/schema";
import { TaskForm } from "./TaskForm";

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  medium: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  high: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const isDone = task.status === "done";
  const boundUpdate = updateTask.bind(null, task.id);

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task.id);
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <TaskForm
          action={boundUpdate}
          task={task}
          submitLabel="Save changes"
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="group flex gap-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-violet-200/80 hover:shadow-md">
      <form action={toggleTaskStatus.bind(null, task.id)} className="pt-0.5">
        <button
          type="submit"
          aria-label={isDone ? "Mark as to do" : "Mark as done"}
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
            isDone
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-zinc-300 hover:border-violet-400 hover:bg-violet-50"
          }`}
        >
          {isDone && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
              <path d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0L1.72 6.34a.75.75 0 1 1 1.06-1.06l1.94 1.94 4.72-4.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
          )}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`font-medium text-zinc-900 ${isDone ? "text-zinc-400 line-through" : ""}`}
          >
            {task.title}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityStyles[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p
            className={`mt-1 text-sm ${isDone ? "text-zinc-400" : "text-zinc-500"}`}
          >
            {task.description}
          </p>
        )}
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
    </li>
  );
}
