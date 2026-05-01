"use client";

import {
  useState,
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import type { Board, Task } from "@/types";
import { Column } from "./column";
import { TaskCard } from "./task-card";
import { moveTask } from "@/actions/task";
import { useUIStore } from "@/store/ui-store";

interface KanbanBoardProps {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
}

export function KanbanBoard({ board, setBoard }: KanbanBoardProps) {
  const router = useRouter();
  const { filters } = useUIStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const visibleColumns = useMemo(() => {
    return board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        const matchesPriority =
          !filters.priority || task.priority === filters.priority;
        const matchesTag =
          !filters.tagId ||
          task.tags?.some((taskTag) => taskTag.tag.id === filters.tagId);

        return matchesPriority && matchesTag;
      }),
    }));
  }, [board.columns, filters.priority, filters.tagId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = event.active.id as string;
      for (const col of board.columns) {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) {
          setActiveTask(task);
          break;
        }
      }
    },
    [board.columns]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Find source column
      const sourceCol = board.columns.find((c) =>
        c.tasks.some((t) => t.id === taskId)
      );

      // Determine target column
      let targetColId: string;
      const targetColDirect = board.columns.find((c) => c.id === overId);
      if (targetColDirect) {
        targetColId = overId;
      } else {
        const taskInCol = board.columns.find((c) =>
          c.tasks.some((t) => t.id === overId)
        );
        targetColId = taskInCol?.id || sourceCol?.id || "";
      }

      if (!targetColId) return;

      // Instant local move (optimistic UI)
      setBoard((prev) => {
        const fromColumn = prev.columns.find((c) =>
          c.tasks.some((t) => t.id === taskId)
        );
        const movingTask = fromColumn?.tasks.find((t) => t.id === taskId);
        if (!movingTask) return prev;

        const nextColumns = prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }));
        const toColumn = nextColumns.find((c) => c.id === targetColId);
        if (toColumn) {
          toColumn.tasks.push({ ...movingTask, columnId: targetColId });
        }
        return { ...prev, columns: nextColumns };
      });

      moveTask(taskId, targetColId).catch(() => {
        // If persistence fails, resync from server snapshot.
        router.refresh();
      });
    },
    [board.columns, setBoard, router]
  );

  return (
    <DndContext
      id="board-dnd-context"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full items-stretch gap-4 p-4 h-full overflow-x-auto">
        {visibleColumns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72 rotate-2 opacity-90">
            <TaskCard task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
