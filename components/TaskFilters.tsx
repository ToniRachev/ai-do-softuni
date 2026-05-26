"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">
            {[filters.status, filters.priority?.length, filters.dueDate].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Filters Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[320px] rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 shadow-lg">
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
      )}
    </div>
  );
}

export function TaskFilters() {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-24 animate-pulse rounded-md bg-zinc-100" aria-hidden />
      }
    >
      <TaskFiltersInner />
    </Suspense>
  );
}
