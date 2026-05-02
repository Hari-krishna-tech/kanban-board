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
  Backlog: "bg-slate-100 dark:bg-slate-800",
  Learning: "bg-blue-50 dark:bg-blue-950/30",
  Practicing: "bg-amber-50 dark:bg-amber-950/30",
  Completed: "bg-green-50 dark:bg-green-950/30",
};

const columnHeaderColors: Record<string, string> = {
  Backlog: "text-slate-600 dark:text-slate-400",
  Learning: "text-blue-600 dark:text-blue-400",
  Practicing: "text-amber-600 dark:text-amber-400",
  Completed: "text-green-600 dark:text-green-400",
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
  const Icon = columnIcons[column.name] || ClipboardList;

  const handleCreateTask = () => {
    setSelectedTaskId(null);
    setSelectedTaskId(column.id);
    setTaskDialogOpen(true);
  };

  return (
    <div
      className={`flex flex-col flex-1 min-w-[260px] min-h-0 rounded-xl ${bgColor} border border-slate-200/60 dark:border-slate-700/50`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${headerColor}`} />
          <h3 className={`text-sm font-semibold ${headerColor}`}>
            {column.name}
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
            {column.tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCreateTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 px-2 pb-2 min-h-[120px] overflow-y-auto transition-colors rounded-b-xl ${
          isOver ? "bg-slate-200/50 dark:bg-slate-700/20" : ""
        }`}
      >
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center flex-1 text-xs text-slate-400 dark:text-slate-500 py-8">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
