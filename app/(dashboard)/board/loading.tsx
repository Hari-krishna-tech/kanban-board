"use client";

import { useBoardStore } from "@/store/board-store";

export default function BoardLoading() {
  const board = useBoardStore((s) => s.board);

  if (board) {
    return (
      <div className="flex w-full items-stretch gap-4 p-4 h-full overflow-x-auto">
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col flex-1 min-w-[260px] rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50"
          >
            <div className="h-12 px-4 py-3 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {column.name}
              </div>
              <div className="text-xs text-slate-400">{column.tasks.length}</div>
            </div>
            <div className="flex-1 px-2 pb-2 space-y-2">
              {column.tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-3"
                >
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {task.description}
                    </div>
                  )}
                </div>
              ))}
              {column.tasks.length === 0 && (
                <div className="h-20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 h-full overflow-x-auto">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col w-72 min-w-[288px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
        >
          <div className="h-12 px-4 py-3 flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex-1 px-2 pb-2 space-y-2">
            {[...Array(3)].map((_, j) => (
              <div
                key={j}
                className="h-28 rounded-lg bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
