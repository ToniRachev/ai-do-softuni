import { startOfDay } from "@/lib/date-utils";
import type { TaskWithMeta } from "@/lib/schema";

export type TaskViewMode = "today" | "upcoming" | "all" | "completed";

const VALID_VIEWS: TaskViewMode[] = ["today", "upcoming", "all", "completed"];

export function parseTaskViewParam(value: string | undefined): TaskViewMode {
  if (value && VALID_VIEWS.includes(value as TaskViewMode)) {
    return value as TaskViewMode;
  }
  return "all";
}

function isDueTodayOrOverdue(dueDate: Date, today: Date): boolean {
  const due = startOfDay(dueDate);
  return due.getTime() <= today.getTime();
}

function isDueAfterToday(dueDate: Date, today: Date): boolean {
  const due = startOfDay(dueDate);
  return due.getTime() > today.getTime();
}

export function filterTasksByView(
  tasks: TaskWithMeta[],
  view: TaskViewMode,
): TaskWithMeta[] {
  const today = startOfDay(new Date());

  switch (view) {
    case "today":
      return tasks.filter(
        (t) =>
          t.status === "todo" &&
          t.dueDate !== null &&
          isDueTodayOrOverdue(t.dueDate, today),
      );
    case "upcoming":
      return tasks.filter(
        (t) =>
          t.status === "todo" &&
          t.dueDate !== null &&
          isDueAfterToday(t.dueDate, today),
      );
    case "completed":
      return tasks.filter((t) => t.status === "done");
    case "all":
    default:
      return tasks;
  }
}

type EmptyMessageContext = {
  scopeName?: string;
};

function scopedSuffix(scopeName?: string): string {
  return scopeName ? ` in "${scopeName}"` : "";
}

export function getEmptyMessageForView(
  view: TaskViewMode,
  context?: EmptyMessageContext,
): string {
  const suffix = scopedSuffix(context?.scopeName);

  switch (view) {
    case "today":
      return `Nothing due today${suffix}.`;
    case "upcoming":
      return `No upcoming tasks${suffix}.`;
    case "completed":
      return `No completed tasks yet${suffix}.`;
    case "all":
    default:
      return context?.scopeName
        ? `No tasks in "${context.scopeName}".`
        : "No tasks yet.";
  }
}
