"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getInsights() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const board = await prisma.board.findFirst({
    where: { userId: session.user.id },
    include: {
      tasks: {
        include: {
          tags: { include: { tag: true } },
          timeEntries: true,
        },
      },
    },
  });

  if (!board) {
    return {
      weeklyCompletion: [],
      streak: 0,
      totalTimeSpent: 0,
      categoryBreakdown: [],
      completedCount: 0,
      totalCount: 0,
    };
  }

  const tasks = board.tasks;
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  // Weekly completion (last 4 weeks)
  const weeklyCompletion: { week: string; count: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() - i * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const count = completedTasks.filter((t) => {
      const d = new Date(t.updatedAt);
      return d >= startOfWeek && d <= endOfWeek;
    }).length;

    const weekLabel = startOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    weeklyCompletion.push({ week: weekLabel, count });
  }

  // Learning streak (consecutive days with at least 1 task update)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const nextDate = new Date(checkDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const hasActivity = tasks.some((t) => {
      const d = new Date(t.updatedAt);
      return d >= checkDate && d < nextDate;
    });

    if (hasActivity) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Total time spent
  const totalTimeSpent = tasks.reduce((sum, t) => sum + t.timeSpent, 0);

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const task of tasks) {
    for (const tt of task.tags) {
      const name = tt.tag.name;
      categoryMap.set(name, (categoryMap.get(name) || 0) + 1);
    }
    categoryMap.set(
      task.taskType,
      (categoryMap.get(task.taskType) || 0) + 1
    );
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    weeklyCompletion,
    streak,
    totalTimeSpent,
    categoryBreakdown,
    completedCount: completedTasks.length,
    totalCount: tasks.length,
  };
}
