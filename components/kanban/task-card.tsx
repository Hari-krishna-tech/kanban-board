"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useUIStore } from "@/store/ui-store";

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

const priorityColors: Record<string, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const typeColors: Record<string, string> = {
  Concept: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Project: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Revision: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
};

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const { setTaskDialogOpen, setSelectedTaskId } = useUIStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleClick = () => {
    setSelectedTaskId(task.id);
    setTaskDialogOpen(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        "group bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all",
        isDragging && "opacity-50 shadow-lg",
        isOverlay && "shadow-xl"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 leading-snug">
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags?.map((tt) => (
          <Badge
            key={tt.tag.id}
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {tt.tag.name}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 h-4", priorityColors[task.priority])}
        >
          {task.priority}
        </Badge>
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 h-4", typeColors[task.taskType])}
        >
          {task.taskType}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 dark:text-slate-500">
        {task.dueDate ? (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        ) : (
          <span />
        )}
        {task.timeSpent > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {Math.round(task.timeSpent / 60)}h {task.timeSpent % 60}m
          </span>
        )}
      </div>

      {totalSubtasks > 0 && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {completedSubtasks}/{totalSubtasks} subtasks
            </span>
          </div>
          <Progress
            value={(completedSubtasks / totalSubtasks) * 100}
            className="h-1"
          />
        </div>
      )}

      {task.progress > 0 && totalSubtasks === 0 && (
        <div className="mt-2 space-y-1">
          <Progress value={task.progress} className="h-1" />
        </div>
      )}
    </div>
  );
}
