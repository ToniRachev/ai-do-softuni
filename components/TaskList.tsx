import type { Category, Project, TaskWithMeta } from "@/lib/schema";
import { TaskItem } from "./TaskItem";

function sortActiveByDueDate(taskList: TaskWithMeta[]): TaskWithMeta[] {
  return [...taskList].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

type TaskListProps = {
  tasks: TaskWithMeta[];
  projects: Project[];
  categories: Category[];
  emptyMessage?: string;
};

function TaskSection({
  title,
  tasks,
  projects,
  categories,
}: {
  title: string;
  tasks: TaskWithMeta[];
  projects: Project[];
  categories: Category[];
}) {
  if (tasks.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {title}
        <span className="ml-2 font-normal text-zinc-400">({tasks.length})</span>
      </h3>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            projects={projects}
            categories={categories}
          />
        ))}
      </ul>
    </section>
  );
}

export function TaskList({
  tasks,
  projects,
  categories,
  emptyMessage = "No tasks yet.",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
        <p className="text-zinc-500">{emptyMessage}</p>
        <p className="mt-1 text-sm text-zinc-400">Add one on the left to get started.</p>
      </div>
    );
  }

  const active = sortActiveByDueDate(tasks.filter((t) => t.status === "todo"));
  const completed = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-8">
      <TaskSection
        title="To do"
        tasks={active}
        projects={projects}
        categories={categories}
      />
      <TaskSection
        title="Completed"
        tasks={completed}
        projects={projects}
        categories={categories}
      />
    </div>
  );
}
