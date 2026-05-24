"use server";

import { db } from "@/lib/db";
import { parseDueDateInput } from "@/lib/date-utils";
import { categories, tasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = {
  success: boolean;
  error?: string;
};

const optionalIdSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "done"]).optional(),
  projectId: optionalIdSchema,
  categoryId: optionalIdSchema,
  dueDate: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => parseDueDateInput(typeof v === "string" ? v : null)),
});

function parseTaskForm(formData: FormData) {
  return taskInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    priority: formData.get("priority") ?? "medium",
    status: formData.get("status") ?? undefined,
    projectId: formData.get("projectId"),
    categoryId: formData.get("categoryId"),
    dueDate: formData.get("dueDate"),
  });
}

function parseNewCategoryName(formData: FormData): string | undefined {
  const raw = formData.get("newCategoryName");
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function resolveCategoryId(
  categoryId: number | null,
  newCategoryName: string | undefined,
): Promise<{ categoryId: number | null; error?: string }> {
  if (!newCategoryName) {
    return { categoryId };
  }

  try {
    const [inserted] = await db
      .insert(categories)
      .values({
        name: newCategoryName,
        createdAt: new Date(),
      })
      .returning({ id: categories.id });
    return { categoryId: inserted.id };
  } catch {
    return {
      categoryId: null,
      error: "A category with this name already exists",
    };
  }
}

function revalidateTaskPaths(projectId?: number | null, categoryId?: number | null) {
  revalidatePath("/");
  revalidatePath("/categories");
  if (categoryId) {
    revalidatePath(`/categories/${categoryId}`);
  }
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

export async function createTask(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const resolved = await resolveCategoryId(
    parsed.data.categoryId,
    parseNewCategoryName(formData),
  );
  if (resolved.error) {
    return { success: false, error: resolved.error };
  }

  const now = new Date();
  await db.insert(tasks).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    priority: parsed.data.priority,
    status: "todo",
    projectId: parsed.data.projectId,
    categoryId: resolved.categoryId,
    dueDate: parsed.data.dueDate,
    createdAt: now,
    updatedAt: now,
  });

  revalidateTaskPaths(parsed.data.projectId, resolved.categoryId);
  return { success: true };
}

export async function updateTask(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!existing) {
    return { success: false, error: "Task not found" };
  }

  const resolved = await resolveCategoryId(
    parsed.data.categoryId,
    parseNewCategoryName(formData),
  );
  if (resolved.error) {
    return { success: false, error: resolved.error };
  }

  const now = new Date();
  await db
    .update(tasks)
    .set({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      priority: parsed.data.priority,
      status: parsed.data.status ?? "todo",
      projectId: parsed.data.projectId,
      categoryId: resolved.categoryId,
      dueDate: parsed.data.dueDate,
      updatedAt: now,
    })
    .where(eq(tasks.id, id));

  revalidateTaskPaths(parsed.data.projectId, resolved.categoryId);
  if (existing.projectId && existing.projectId !== parsed.data.projectId) {
    revalidatePath(`/projects/${existing.projectId}`);
  }
  if (existing.categoryId && existing.categoryId !== resolved.categoryId) {
    revalidatePath(`/categories/${existing.categoryId}`);
  }

  return { success: true };
}

export async function deleteTask(id: number): Promise<void> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task) return;

  await db.delete(tasks).where(eq(tasks.id, id));
  revalidateTaskPaths(task.projectId, task.categoryId);
}

export async function toggleTaskStatus(id: number): Promise<void> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task) return;

  const nextStatus = task.status === "todo" ? "done" : "todo";
  await db
    .update(tasks)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(tasks.id, id));

  revalidateTaskPaths(task.projectId, task.categoryId);
}
