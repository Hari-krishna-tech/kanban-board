"use client";

import { useEffect } from "react";
import type { Board } from "@/types";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { TaskDialog } from "@/components/kanban/task-dialog";
import { useBoardStore } from "@/store/board-store";

interface BoardClientProps {
  initialBoard: Board;
}

export function BoardClient({ initialBoard }: BoardClientProps) {
  const board = useBoardStore((s) => s.board);
  const setBoard = useBoardStore((s) => s.setBoard);
  const initializeBoard = useBoardStore((s) => s.initializeBoard);

  useEffect(() => {
    initializeBoard(initialBoard);
  }, [initialBoard, initializeBoard]);

  const activeBoard = board && board.id === initialBoard.id ? board : initialBoard;

  return (
    <>
      <KanbanBoard board={activeBoard} setBoard={setBoard} />
      <TaskDialog board={activeBoard} setBoard={setBoard} />
    </>
  );
}
