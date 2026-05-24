"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { parseTaskViewParam, type TaskViewMode } from "@/lib/task-view";

const viewItems: { mode: TaskViewMode; label: string }[] = [
  { mode: "today", label: "Today" },
  { mode: "upcoming", label: "Upcoming" },
  { mode: "all", label: "All tasks" },
  { mode: "completed", label: "Completed" },
];

function buildHref(pathname: string, searchParams: URLSearchParams, mode: TaskViewMode): string {
  const params = new URLSearchParams(searchParams.toString());
  if (mode === "all") {
    params.delete("view");
  } else {
    params.set("view", mode);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function TaskViewTabsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeView = parseTaskViewParam(searchParams.get("view") ?? undefined);

  return (
    <nav
      className="flex flex-wrap items-center gap-1 rounded-full border border-zinc-200/80 bg-zinc-100/60 p-1"
      aria-label="Task views"
    >
      {viewItems.map(({ mode, label }) => {
        const isActive = activeView === mode;
        const href = buildHref(pathname, searchParams, mode);

        return (
          <Link
            key={mode}
            href={href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all sm:px-4 ${
              isActive
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TaskViewTabs() {
  return (
    <Suspense
      fallback={
        <div
          className="h-9 w-72 animate-pulse rounded-full bg-zinc-100"
          aria-hidden
        />
      }
    >
      <TaskViewTabsInner />
    </Suspense>
  );
}
