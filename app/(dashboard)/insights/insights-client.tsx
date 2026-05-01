"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Clock, CheckCircle2, Target } from "lucide-react";
import { useInsightsStore } from "@/store/insights-store";
import type { InsightsData } from "@/types";

const BAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
];

function WeeklyCompletionBars({
  data,
}: {
  data: { week: string; count: number }[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-3 h-[200px] px-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {item.count}
          </span>
          <div
            className="w-full rounded-t-md bg-blue-500 dark:bg-blue-400 transition-all"
            style={{
              height: `${Math.max((item.count / maxCount) * 160, 4)}px`,
            }}
          />
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            {item.week}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-slate-400">
        No data yet. Start adding tags and types to your tasks!
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4">
      {data.map((item, i) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                {item.name}
              </span>
              <span className="text-slate-500">
                {item.count} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InsightsClient({ data }: { data: InsightsData }) {
  const setInsights = useInsightsStore((s) => s.setInsights);

  useEffect(() => {
    setInsights(data);
  }, [data, setInsights]);

  const completionRate =
    data.totalCount > 0
      ? Math.round((data.completedCount / data.totalCount) * 100)
      : 0;

  const hours = Math.floor(data.totalTimeSpent / 60);
  const minutes = data.totalTimeSpent % 60;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Insights
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Learning Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.streak} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Time Spent
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {hours}h {minutes}m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.completedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {completionRate}%
            </div>
            <Progress value={completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyCompletionBars data={data.weeklyCompletion} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={data.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                {data.completedCount} of {data.totalCount} tasks completed
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {completionRate}%
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
