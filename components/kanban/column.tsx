"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Column as ColumnType } from "@/types";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pin,
  BookOpen,
  Zap,
  CheckCircle2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";

interface ColumnProps {
  column: ColumnType;
}

const columnColors: Record<string, string> = {
  Backlog: "bg-slate-100/80 dark:bg-slate-900/72",
  Learning: "bg-sky-50/90 dark:bg-sky-950/24",
  Practicing: "bg-amber-50/90 dark:bg-amber-950/24",
  Completed: "bg-emerald-50/90 dark:bg-emerald-950/24",
};

const columnHeaderColors: Record<string, string> = {
  Backlog: "text-slate-600 dark:text-slate-300",
  Learning: "text-sky-700 dark:text-sky-300",
  Practicing: "text-amber-600 dark:text-amber-400",
  Completed: "text-emerald-700 dark:text-emerald-300",
};

const columnAccentColors: Record<string, string> = {
  Backlog: "bg-slate-400",
  Learning: "bg-sky-500",
  Practicing: "bg-amber-500",
  Completed: "bg-emerald-500",
};

const columnIcons: Record<string, LucideIcon> = {
  Backlog: Pin,
  Learning: BookOpen,
  Practicing: Zap,
  Completed: CheckCircle2,
};

export function Column({ column }: ColumnProps) {
  const { setTaskDialogOpen, setSelectedTaskId } = useUIStore();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const bgColor = columnColors[column.name] || "bg-slate-50 dark:bg-slate-900";
  const headerColor = columnHeaderColors[column.name] || "text-slate-600";
  const accentColor = columnAccentColors[column.name] || "bg-slate-400";
  const Icon = columnIcons[column.name] || ClipboardList;

  const handleCreateTask = () => {
    setSelectedTaskId(null);
    setSelectedTaskId(column.id);
    setTaskDialogOpen(true);
  };

  return (
    <div
      className={`relative flex min-h-0 min-w-[280px] flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 ${bgColor} shadow-sm backdrop-blur-xl`}
    >
      <div className={`h-1 w-full ${accentColor}`} />
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-background/70 ring-1 ring-border/70">
            <Icon className={`h-4 w-4 ${headerColor}`} />
          </div>
          <h3 className={`text-sm font-semibold tracking-tight ${headerColor}`}>
            {column.name}
          </h3>
          <span className="ml-1 rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/70">
            {column.tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-background/80"
          onClick={handleCreateTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 transition-colors ${
          isOver ? "bg-background/52" : ""
        }`}
      >
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {column.tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/35 py-8 text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
