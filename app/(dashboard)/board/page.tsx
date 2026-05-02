import { Suspense } from "react";
import { getBoard, getAllTags } from "@/actions/board";
import { BoardFilters } from "@/components/kanban/board-filters";
import { BoardClient } from "@/components/kanban/board-client";

export default async function BoardPage() {
  const board = await getBoard();
  const tags = await getAllTags();

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={null}>
        <BoardFilters tags={tags} />
      </Suspense>
      <div className="flex-1 min-h-0 overflow-hidden">
        <BoardClient initialBoard={board} />
      </div>
    </div>
  );
}
