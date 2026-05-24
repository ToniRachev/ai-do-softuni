export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDueDateInput(value: string | null | undefined): Date | null {
  if (!value || value.trim() === "") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDueDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type DueDateStatus = "overdue" | "today" | "upcoming" | null;

export function getDueDateStatus(
  dueDate: Date | null | undefined,
  isDone: boolean,
): DueDateStatus {
  if (!dueDate || isDone) return null;
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  if (due.getTime() < today.getTime()) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "upcoming";
}

// Date range helpers for filtering

export function isOverdue(date: Date | null | undefined): boolean {
  if (!date) return false;
  const today = startOfDay(new Date());
  const due = startOfDay(date);
  return due.getTime() < today.getTime();
}

export function isToday(date: Date | null | undefined): boolean {
  if (!date) return false;
  const today = startOfDay(new Date());
  const due = startOfDay(date);
  return due.getTime() === today.getTime();
}

export function isThisWeek(date: Date | null | undefined): boolean {
  if (!date) return false;
  const now = new Date();
  const due = startOfDay(date);

  // Get the start of this week (Monday)
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
  weekStart.setHours(0, 0, 0, 0);

  // Get the end of this week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return due.getTime() >= startOfDay(weekStart).getTime() && due.getTime() <= startOfDay(weekEnd).getTime();
}

export function isThisMonth(date: Date | null | undefined): boolean {
  if (!date) return false;
  const now = new Date();
  const due = date;
  return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth();
}

export function hasDueDate(date: Date | null | undefined): boolean {
  return date !== null && date !== undefined;
}
