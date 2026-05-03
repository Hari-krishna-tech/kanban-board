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
  High: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300",
  Medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300",
  Low: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300",
};

const typeColors: Record<string, string> = {
  Concept: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/50 dark:text-violet-300",
  Project: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-300",
  Revision: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/70 dark:bg-teal-950/50 dark:text-teal-300",
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
        "group cursor-pointer rounded-xl border border-border/75 bg-card/92 p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-slate-950/5 dark:bg-card/78",
        isDragging && "opacity-50 shadow-xl",
        isOverlay && "shadow-2xl"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground">
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags?.map((tt) => (
          <Badge
            key={tt.tag.id}
            variant="secondary"
            className="h-5 rounded-md px-1.5 py-0 text-[10px] font-medium"
          >
            {tt.tag.name}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("h-5 rounded-md px-1.5 py-0 text-[10px] font-medium", priorityColors[task.priority])}
        >
          {task.priority}
        </Badge>
        <Badge
          variant="outline"
          className={cn("h-5 rounded-md px-1.5 py-0 text-[10px] font-medium", typeColors[task.taskType])}
        >
          {task.taskType}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
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
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
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
