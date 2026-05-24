import type { Task } from "@/lib/schema";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
};

function TaskSection({
  title,
  tasks,
}: {
  title: string;
  tasks: Task[];
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
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
        <p className="text-zinc-500">No tasks yet.</p>
        <p className="mt-1 text-sm text-zinc-400">Add one on the left to get started.</p>
      </div>
    );
  }

  const active = tasks.filter((t) => t.status === "todo");
  const completed = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-8">
      <TaskSection title="To do" tasks={active} />
      <TaskSection title="Completed" tasks={completed} />
    </div>
  );
}
