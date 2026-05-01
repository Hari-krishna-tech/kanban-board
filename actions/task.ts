"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  dueDate: z.string().optional().nullable(),
  taskType: z.enum(["Concept", "Project", "Revision"]).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export async function createTask(
  columnId: string,
  boardId: string,
  data: z.infer<typeof taskSchema>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = taskSchema.parse(data);

  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const task = await prisma.task.create({
    data: {
      ...parsed,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      status: (
        await prisma.column.findUnique({ where: { id: columnId } })
      )?.name || "Backlog",
      order: (lastTask?.order ?? -1) + 1,
      columnId,
      boardId,
    },
    include: {
      tags: { include: { tag: true } },
      subtasks: true,
      resources: true,
    },
  });

  revalidatePath("/board");
  return task;
}

export async function updateTask(
  taskId: string,
  data: Partial<z.infer<typeof taskSchema>>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
    },
    include: {
      tags: { include: { tag: true } },
      subtasks: true,
      resources: true,
    },
  });

  revalidatePath("/board");
  return task;
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/board");
}

export async function moveTask(
  taskId: string,
  targetColumnId: string,
  newOrder?: number
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const column = await prisma.column.findUnique({
    where: { id: targetColumnId },
    select: { name: true },
  });

  const data: Record<string, unknown> = {
    columnId: targetColumnId,
    status: column?.name || "Backlog",
  };

  if (newOrder !== undefined) {
    data.order = newOrder;
  }

  await prisma.task.update({
    where: { id: taskId },
    data,
  });

  revalidatePath("/board");
}
