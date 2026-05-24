"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { TaskFilters } from "@/lib/task-view";
import { parseTaskFiltersFromParams } from "@/lib/task-view";

function buildFilterUrl(
  pathname: string,
  searchParams: URLSearchParams,
  newFilters: Partial<TaskFilters>,
): string {
  const params = new URLSearchParams(searchParams.toString());

  // Update filters
  if (newFilters.status !== undefined) {
    if (newFilters.status) {
      params.set("status", newFilters.status);
    } else {
      params.delete("status");
    }
  }

  if (newFilters.priority !== undefined) {
    if (newFilters.priority && newFilters.priority.length > 0) {
      params.set("priority", newFilters.priority.join(","));
    } else {
      params.delete("priority");
    }
  }

  if (newFilters.dueDate !== undefined) {
    if (newFilters.dueDate) {
      params.set("dueDate", newFilters.dueDate);
    } else {
      params.delete("dueDate");
    }
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildClearFiltersUrl(pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString());
  // Keep the view param, clear all filters
  params.delete("status");
  params.delete("priority");
  params.delete("dueDate");

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function TaskFiltersInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseTaskFiltersFromParams(
    Object.fromEntries(searchParams.entries()),
  );

  const hasActiveFilters = filters.status || filters.priority || filters.dueDate;

  return (
    <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-700">Filters</h3>
        {hasActiveFilters && (
          <Link
            href={buildClearFiltersUrl(pathname, searchParams)}
            className="text-xs font-medium text-zinc-500 transition hover:text-zinc-700"
          >
            Clear all
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {/* Status Filter */}
        <div>
          <label htmlFor="statusFilter" className="block text-xs font-medium text-zinc-600 mb-1.5">
            Status
          </label>
          <select
            id="statusFilter"
            value={filters.status || ""}
            onChange={(e) => {
              const value = e.target.value as "todo" | "done" | "";
              const href = buildFilterUrl(pathname, searchParams, {
                ...filters,
                status: value || undefined,
              });
              globalThis.location.href = href;
            }}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 transition hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-0"
          >
            <option value="">All statuses</option>
            <option value="todo">To do</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <fieldset>
          <legend className="block text-xs font-medium text-zinc-600 mb-1.5">Priority</legend>
          <div className="space-y-1.5">
            {["low", "medium", "high"].map((priority) => {
              const isChecked = filters.priority?.includes(priority) || false;
              const newPriorities = isChecked
                ? filters.priority!.filter((p) => p !== priority)
                : [...(filters.priority || []), priority];

              return (
                <div key={priority} className="flex items-center">
                  <Link
                    href={buildFilterUrl(pathname, searchParams, {
                      ...filters,
                      priority: newPriorities.length > 0 ? newPriorities : undefined,
                    })}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={`priority-${priority}`}
                      checked={isChecked}
                      readOnly
                      className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer h-3.5 w-3.5"
                    />
                    <label
                      htmlFor={`priority-${priority}`}
                      className="text-xs text-zinc-600 capitalize cursor-pointer"
                    >
                      {priority}
                    </label>
                  </Link>
                </div>
              );
            })}
          </div>
        </fieldset>

        {/* Due Date Filter */}
        <div>
          <label htmlFor="dueDateFilter" className="block text-xs font-medium text-zinc-600 mb-1.5">
            Due date
          </label>
          <select
            id="dueDateFilter"
            value={filters.dueDate || ""}
            onChange={(e) => {
              const value = e.target.value;
              const href = buildFilterUrl(pathname, searchParams, {
                ...filters,
                dueDate: (value as any) || undefined,
              });
              globalThis.location.href = href;
            }}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 transition hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-0"
          >
            <option value="">Any date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="this-week">This week</option>
            <option value="this-month">This month</option>
            <option value="no-due-date">No due date</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function TaskFilters() {
  return (
    <Suspense
      fallback={
        <div className="h-40 w-full animate-pulse rounded-lg bg-zinc-100" aria-hidden />
      }
    >
      <TaskFiltersInner />
    </Suspense>
  );
}
