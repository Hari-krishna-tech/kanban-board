"use client";

import { useInsightsStore } from "@/store/insights-store";

export default function InsightsLoading() {
  const insights = useInsightsStore((s) => s.insights);

  if (insights) {
    const completionRate =
      insights.totalCount > 0
        ? Math.round((insights.completedCount / insights.totalCount) * 100)
        : 0;
    const hours = Math.floor(insights.totalTimeSpent / 60);
    const minutes = insights.totalTimeSpent % 60;

    return (
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Insights
        </h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500">Learning Streak</div>
            <div className="mt-2 text-xl font-semibold">{insights.streak} days</div>
          </div>
          <div className="h-28 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500">Time Spent</div>
            <div className="mt-2 text-xl font-semibold">
              {hours}h {minutes}m
            </div>
          </div>
          <div className="h-28 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500">Completed</div>
            <div className="mt-2 text-xl font-semibold">{insights.completedCount}</div>
          </div>
          <div className="h-28 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500">Completion Rate</div>
            <div className="mt-2 text-xl font-semibold">{completionRate}%</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[380px] rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-[380px] rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
