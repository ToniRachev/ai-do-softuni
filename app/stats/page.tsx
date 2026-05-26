import Link from "next/link";

import { CompletionChart } from "@/components/CompletionChart";
import {
  getCompletedTasksByDay,
  getProjectCompletionStats,
  getStatsOverview,
} from "@/lib/statistics-query";

export const dynamic = "force-dynamic";

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="glass-card rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export default async function StatsPage() {
  const [overview, completionByDay, projectStats] = await Promise.all([
    getStatsOverview(),
    getCompletedTasksByDay(),
    getProjectCompletionStats(),
  ]);

  const topProjects = projectStats
    .filter((project) => project.totalTasks > 0)
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Statistics</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              A dedicated view for productivity metrics, overdue tasks, project completion, and short-term momentum.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Back to tasks
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total tasks"
          value={overview.totalTasks.toString()}
          description="All tasks across categories and projects."
        />
        <StatCard
          label="Completed tasks"
          value={overview.completedTasks.toString()}
          description="Tasks marked done so far."
        />
        <StatCard
          label="Completion rate"
          value={`${overview.completionRate}%`}
          description="Share of tasks finished overall."
        />
        <StatCard
          label="Pending tasks"
          value={overview.pendingTasks.toString()}
          description="Work remaining in your queue."
        />
        <StatCard
          label="Overdue tasks"
          value={overview.overdueTasks.toString()}
          description="Tasks with a past due date that still need attention."
        />
        <StatCard
          label="Due soon"
          value={overview.dueSoonTasks.toString()}
          description="Tasks due within the next 7 days."
        />
      </section>

      <section className="glass-card mt-8 rounded-3xl p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Completion trend</h2>
            <p className="mt-1 text-sm text-zinc-500">Last 30 days of completed tasks to help you spot momentum and gaps.</p>
          </div>
          <p className="text-sm text-zinc-500">Updated in real time with recent task activity.</p>
        </div>
        <CompletionChart data={completionByDay} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="glass-card rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Most active projects</h2>
              <p className="mt-1 text-sm text-zinc-500">Projects with the highest task volume and current completion status.</p>
            </div>
          </div>

          {topProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              No projects with tasks yet. Add tasks to a project to track project completion progress.
            </div>
          ) : (
            <div className="space-y-4">
              {topProjects.map((project) => (
                <div
                  key={project.projectId}
                  className="rounded-3xl border border-zinc-200/80 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{project.projectName}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {project.totalTasks} tasks • {project.completedTasks} completed
                      </p>
                    </div>
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      {project.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">What to act on</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-4">
              <p className="text-sm font-medium text-zinc-900">Reduce overdue work</p>
              <p className="mt-1 text-sm text-zinc-500">
                {overview.overdueTasks === 0
                  ? "Great job — no overdue tasks right now."
                  : `You have ${overview.overdueTasks} overdue task${overview.overdueTasks === 1 ? "" : "s"}.`}
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-4">
              <p className="text-sm font-medium text-zinc-900">Stay ahead of due dates</p>
              <p className="mt-1 text-sm text-zinc-500">
                {overview.dueSoonTasks === 0
                  ? "No tasks due in the next 7 days. Keep planning ahead."
                  : `You have ${overview.dueSoonTasks} task${overview.dueSoonTasks === 1 ? "" : "s"} due soon.`}
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-4">
              <p className="text-sm font-medium text-zinc-900">Focus on progress</p>
              <p className="mt-1 text-sm text-zinc-500">
                {overview.pendingTasks > 0
                  ? `There are ${overview.pendingTasks} open tasks waiting to be completed.`
                  : "All tasks are complete — nice work!"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
