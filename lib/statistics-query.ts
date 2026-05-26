import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/schema";
import { count, eq, and, gte, desc } from "drizzle-orm";

export type CompletionByDay = {
  date: string; // YYYY-MM-DD
  completed: number;
};

export type GlobalCompletionStats = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0-100
};

export type ProjectCompletionStats = {
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0-100
};

/**
 * Get completed tasks grouped by day for the last 30 days
 */
export async function getCompletedTasksByDay(): Promise<CompletionByDay[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all completed tasks (temporarily without date filter for debugging)
  const rows = await db
    .select({
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .where(eq(tasks.status, "done"));

  // Group by day in JavaScript
  const byDay = new Map<string, number>();

  for (const row of rows) {
    const dateObj = new Date(row.updatedAt);
    const dateStr = dateObj.toISOString().split("T")[0];
    byDay.set(dateStr, (byDay.get(dateStr) || 0) + 1);
  }

  // Create an array for the last 30 days, filling in zeros for days with no completions
  const result: CompletionByDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      completed: byDay.get(dateStr) || 0,
    });
  }

  return result;
}

/**
 * Get global completion stats across all tasks
 */
export async function getGlobalCompletionStats(): Promise<GlobalCompletionStats> {
  const rows = await db
    .select({
      status: tasks.status,
      taskCount: count(tasks.id),
    })
    .from(tasks)
    .groupBy(tasks.status);

  let totalTasks = 0;
  let completedTasks = 0;

  for (const row of rows) {
    const taskCount = row.taskCount;
    totalTasks += taskCount;
    if (row.status === "done") {
      completedTasks = taskCount;
    }
  }

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
  };
}

/**
 * Get completion stats for each project
 */
export async function getProjectCompletionStats(): Promise<
  ProjectCompletionStats[]
> {
  const rows = await db
    .select({
      projectId: projects.id,
      projectName: projects.name,
      status: tasks.status,
      taskCount: count(tasks.id),
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .groupBy(projects.id, projects.name, tasks.status)
    .orderBy(desc(projects.updatedAt));

  // Group by project
  const byProject = new Map<
    number,
    { name: string; total: number; completed: number }
  >();

  for (const row of rows) {
    const proj = byProject.get(row.projectId) || {
      name: row.projectName,
      total: 0,
      completed: 0,
    };

    proj.total += row.taskCount;
    if (row.status === "done") {
      proj.completed = row.taskCount;
    }

    byProject.set(row.projectId, proj);
  }

  const result: ProjectCompletionStats[] = [];
  for (const [projectId, proj] of byProject) {
    const completionRate =
      proj.total > 0 ? Math.round((proj.completed / proj.total) * 100) : 0;
    result.push({
      projectId,
      projectName: proj.name,
      totalTasks: proj.total,
      completedTasks: proj.completed,
      completionRate,
    });
  }

  return result;
}
