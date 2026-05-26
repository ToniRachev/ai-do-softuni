"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CompletionByDay } from "@/lib/statistics-query";

type CompletionChartProps = {
  data: CompletionByDay[];
};

export function CompletionChart({ data }: CompletionChartProps) {
  if (data.length === 0 || data.every((d) => d.completed === 0)) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">
          No completed tasks yet. Complete tasks to see your productivity chart.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#a1a1aa"
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelFormatter={(date) => {
              const d = new Date(date);
              return d.toLocaleDateString();
            }}
            formatter={(value) => [`${value} tasks`, "Completed"]}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ fill: "#7c3aed", r: 4 }}
            activeDot={{ r: 6 }}
            name="Completed Tasks"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
