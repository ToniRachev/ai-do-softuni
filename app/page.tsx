import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
import { createTask } from "@/app/actions/tasks";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";

export default async function Home() {
  const allTasks = await db
    .select()
    .from(tasks)
    .orderBy(desc(tasks.createdAt));

  const sortedTasks = [
    ...allTasks.filter((t) => t.status === "todo"),
    ...allTasks.filter((t) => t.status === "done"),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Tasks
        </h1>
        <p className="mt-2 text-zinc-500">
          Organize your work with a simple, distraction-free list.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            New task
          </h2>
          <TaskForm action={createTask} submitLabel="Add task" />
        </section>

        <section className="glass-card min-h-[320px] rounded-2xl p-6">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Your tasks
          </h2>
          <TaskList tasks={sortedTasks} />
        </section>
      </div>
    </div>
  );
}
