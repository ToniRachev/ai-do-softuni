"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = {
  success: boolean;
  error?: string;
};

const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

function revalidateCategoryPaths(categoryId?: number) {
  revalidatePath("/");
  revalidatePath("/categories");
  if (categoryId) {
    revalidatePath(`/categories/${categoryId}`);
  }
  revalidatePath("/projects");
}

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = categoryInputSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await db.insert(categories).values({
      name: parsed.data.name,
      createdAt: new Date(),
    });
  } catch {
    return { success: false, error: "A category with this name already exists" };
  }

  revalidateCategoryPaths();
  return { success: true };
}

export async function deleteCategory(id: number): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
  revalidateCategoryPaths(id);
}
