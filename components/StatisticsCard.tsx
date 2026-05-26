import type { GlobalCompletionStats } from "@/lib/statistics-query";

type StatisticsCardProps = {
  stats: GlobalCompletionStats;
};

export function StatisticsCard({ stats }: StatisticsCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Total Tasks
        </p>
        <p className="mt-3 text-3xl font-semibold text-zinc-900">
          {stats.totalTasks}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Completed
        </p>
        <p className="mt-3 text-3xl font-semibold text-zinc-900">
          {stats.completedTasks}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Completion Rate
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl font-semibold text-violet-600">
            {stats.completionRate}%
          </p>
        </div>
      </div>
    </div>
  );
}
