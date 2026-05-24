"use server";

import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = {
  success: boolean;
  error?: string;
};

const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

function parseProjectForm(formData: FormData) {
  return projectInputSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
}

function revalidateProjectPaths(projectId?: number) {
  revalidatePath("/projects");
  if (projectId !== undefined) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/");
}

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const now = new Date();
  await db.insert(projects).values({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    createdAt: now,
    updatedAt: now,
  });

  revalidateProjectPaths();
  return { success: true };
}

export async function updateProject(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const now = new Date();
  await db
    .update(projects)
    .set({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      updatedAt: now,
    })
    .where(eq(projects.id, id));

  revalidateProjectPaths(id);
  return { success: true };
}

export async function deleteProject(id: number): Promise<void> {
  await db.delete(tasks).where(eq(tasks.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
  revalidateProjectPaths(id);
}
