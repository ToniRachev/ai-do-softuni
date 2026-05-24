import { db } from "@/lib/db";
import {
  categories,
  projects,
  tasks,
  type TaskWithMeta,
} from "@/lib/schema";
import { and, desc, eq, type SQL } from "drizzle-orm";

export async function getTasksWithMeta(filters?: {
  projectId?: number;
  categoryId?: number;
}): Promise<TaskWithMeta[]> {
  const conditions: SQL[] = [];
  if (filters?.projectId !== undefined) {
    conditions.push(eq(tasks.projectId, filters.projectId));
  }
  if (filters?.categoryId !== undefined) {
    conditions.push(eq(tasks.categoryId, filters.categoryId));
  }

  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      projectId: tasks.projectId,
      categoryId: tasks.categoryId,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      projectName: projects.name,
      categoryName: categories.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(categories, eq(tasks.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tasks.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    projectId: row.projectId,
    categoryId: row.categoryId,
    dueDate: row.dueDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    projectName: row.projectName,
    categoryName: row.categoryName,
  }));
}

export function sortTasksByStatus<T extends { status: "todo" | "done" }>(
  taskList: T[],
): T[] {
  return [
    ...taskList.filter((t) => t.status === "todo"),
    ...taskList.filter((t) => t.status === "done"),
  ];
}
