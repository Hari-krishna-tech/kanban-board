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
    <div className="flex h-[200px] items-end gap-3 px-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            {item.count}
          </span>
          <div
            className="w-full rounded-t-lg bg-primary transition-all shadow-sm"
            style={{
              height: `${Math.max((item.count / maxCount) * 160, 4)}px`,
            }}
          />
          <span className="whitespace-nowrap text-[10px] text-muted-foreground">
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
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
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
              <span className="text-muted-foreground">
                {item.name}
              </span>
              <span className="font-medium text-foreground">
                {item.count} ({pct}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
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
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track consistency, completion, and where your study time is going.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/78 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Learning Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">
              {data.streak} days
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/78 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time Spent
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">
              {hours}h {minutes}m
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/78 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">
              {data.completedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/78 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">
              {completionRate}%
            </div>
            <Progress value={completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/78 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Weekly Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyCompletionBars data={data.weeklyCompletion} />
          </CardContent>
        </Card>

        <Card className="bg-card/78 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={data.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/78 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {data.completedCount} of {data.totalCount} tasks completed
              </span>
              <span className="font-medium text-foreground">
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
