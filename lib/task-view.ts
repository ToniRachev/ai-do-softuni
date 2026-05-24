import {
  startOfDay,
  isOverdue,
  isToday,
  isThisWeek,
  isThisMonth,
  hasDueDate,
} from "@/lib/date-utils";
import type { TaskWithMeta } from "@/lib/schema";

export type TaskViewMode = "today" | "upcoming" | "all" | "completed";

const VALID_VIEWS = new Set<TaskViewMode>(["today", "upcoming", "all", "completed"]);

export function parseTaskViewParam(value: string | undefined): TaskViewMode {
  if (value && VALID_VIEWS.has(value as TaskViewMode)) {
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

// Advanced filter types

export type DueDateFilter = "overdue" | "today" | "this-week" | "this-month" | "no-due-date";

export type TaskFilters = {
  status?: "todo" | "done";
  priority?: string[]; // comma-separated in URL, split into array
  dueDate?: DueDateFilter;
};

export function parseTaskFiltersFromParams(
  searchParams: Record<string, string | string[] | undefined>,
): TaskFilters {
  const filters: TaskFilters = {};

  if (searchParams.status && typeof searchParams.status === "string") {
    const status = searchParams.status as "todo" | "done" | undefined;
    if (status === "todo" || status === "done") {
      filters.status = status;
    }
  }

  if (searchParams.priority && typeof searchParams.priority === "string") {
    const priorities = searchParams.priority
      .split(",")
      .filter((p) => ["low", "medium", "high"].includes(p));
    if (priorities.length > 0) {
      filters.priority = priorities;
    }
  }

  if (searchParams.dueDate && typeof searchParams.dueDate === "string") {
    const dueDate = searchParams.dueDate;
    const validDueDates: DueDateFilter[] = [
      "overdue",
      "today",
      "this-week",
      "this-month",
      "no-due-date",
    ];
    if (validDueDates.includes(dueDate as DueDateFilter)) {
      filters.dueDate = dueDate as DueDateFilter;
    }
  }

  return filters;
}

function matchesDueDateFilter(dueDate: Date | null | undefined, filter: DueDateFilter): boolean {
  switch (filter) {
    case "overdue":
      return isOverdue(dueDate);
    case "today":
      return isToday(dueDate);
    case "this-week":
      return isThisWeek(dueDate);
    case "this-month":
      return isThisMonth(dueDate);
    case "no-due-date":
      return !hasDueDate(dueDate);
  }
}

export function applyAdvancedFilters(
  tasks: TaskWithMeta[],
  filters: TaskFilters,
): TaskWithMeta[] {
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && !filters.priority.includes(task.priority)) return false;
    if (filters.dueDate && !matchesDueDateFilter(task.dueDate, filters.dueDate)) return false;
    return true;
  });
}
