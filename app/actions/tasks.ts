"use server";

import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = {
  success: boolean;
  error?: string;
};

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
});

function parseTaskForm(formData: FormData) {
  return taskInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    priority: formData.get("priority") ?? "medium",
    status: formData.get("status") ?? undefined,
  });
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

  const now = new Date();
  await db.insert(tasks).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    priority: parsed.data.priority,
    status: "todo",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/");
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

  const now = new Date();
  await db
    .update(tasks)
    .set({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      priority: parsed.data.priority,
      status: parsed.data.status ?? "todo",
      updatedAt: now,
    })
    .where(eq(tasks.id, id));

  revalidatePath("/");
  return { success: true };
}

export async function deleteTask(id: number): Promise<void> {
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/");
}

export async function toggleTaskStatus(id: number): Promise<void> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task) return;

  const nextStatus = task.status === "todo" ? "done" : "todo";
  await db
    .update(tasks)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(tasks.id, id));

  revalidatePath("/");
}
