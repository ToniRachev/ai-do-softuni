import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/schema";
import { count, desc, eq } from "drizzle-orm";

export type ProjectWithCount = {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  taskCount: number;
  completedCount: number;
  completionRate: number; // 0-100
};

export async function getProjectsWithCounts(): Promise<ProjectWithCount[]> {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      status: tasks.status,
      taskCount: count(tasks.id),
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .groupBy(projects.id, tasks.status)
    .orderBy(desc(projects.updatedAt));

  // Group by project to calculate completion rate
  const byProject = new Map<
    number,
    {
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      total: number;
      completed: number;
    }
  >();

  for (const row of rows) {
    const proj = byProject.get(row.id) || {
      name: row.name,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      total: 0,
      completed: 0,
    };

    proj.total += row.taskCount;
    if (row.status === "done") {
      proj.completed = row.taskCount;
    }

    byProject.set(row.id, proj);
  }

  const result: ProjectWithCount[] = [];
  for (const [id, proj] of byProject) {
    const completionRate =
      proj.total > 0 ? Math.round((proj.completed / proj.total) * 100) : 0;
    result.push({
      id,
      name: proj.name,
      description: proj.description,
      createdAt: proj.createdAt,
      updatedAt: proj.updatedAt,
      taskCount: proj.total,
      completedCount: proj.completed,
      completionRate,
    });
  }

  return result;
}
