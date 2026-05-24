import { db } from "@/lib/db";
import { categories, tasks } from "@/lib/schema";
import { asc, count, eq } from "drizzle-orm";

export type CategoryWithCount = {
  id: number;
  name: string;
  createdAt: Date;
  taskCount: number;
};

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
      taskCount: count(tasks.id),
    })
    .from(categories)
    .leftJoin(tasks, eq(tasks.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    taskCount: row.taskCount,
  }));
}
