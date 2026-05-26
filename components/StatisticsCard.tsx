import type { GlobalCompletionStats } from "@/lib/statistics-query";

type StatisticsCardProps = {
  readonly stats: GlobalCompletionStats;
};

export function StatisticsCard({ stats }: StatisticsCardProps) {
  const completionPercentage = Math.round(stats.completionRate);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="glass-card rounded-3xl border border-zinc-200/80 p-5 min-h-42.5">
        <div className="flex h-full min-w-0 flex-col justify-between">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
            Total tasks
          </p>
          <p className="text-3xl font-semibold tracking-tight text-zinc-950 leading-none wrap-break-word">
            {stats.totalTasks}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-zinc-200/80 p-5 min-h-42.5">
        <div className="flex h-full min-w-0 flex-col justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
              Completed
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 leading-none wrap-break-word">
              {stats.completedTasks}
            </p>
          </div>
          <p className="text-sm text-zinc-500 wrap-break-word">
            of {stats.totalTasks} tasks
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-zinc-200/80 p-5 min-h-42.5">
        <div className="flex h-full min-w-0 flex-col justify-between">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
            Completion rate
          </p>
          <div className="max-w-full">
            <p className="text-3xl font-semibold text-zinc-950 tracking-tight leading-none wrap-break-word">
              {completionPercentage}%
            </p>
            <p className="mt-1 text-sm text-zinc-500 wrap-break-word">of tasks completed</p>
          </div>
          <div className="mt-4 h-2 rounded-full bg-violet-100 overflow-hidden">
            <div
              className="h-full w-full rounded-full bg-linear-to-r from-violet-500 to-indigo-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
