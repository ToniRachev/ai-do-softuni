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
};

export async function getProjectsWithCounts(): Promise<ProjectWithCount[]> {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      taskCount: count(tasks.id),
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    taskCount: row.taskCount,
  }));
}
