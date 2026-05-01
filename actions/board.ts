"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const DEFAULT_COLUMNS = [
  { name: "Backlog", order: 0 },
  { name: "Learning", order: 1 },
  { name: "Practicing", order: 2 },
  { name: "Completed", order: 3 },
];

export async function getBoard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let board = await prisma.board.findFirst({
    where: { userId: session.user.id },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              tags: { include: { tag: true } },
              subtasks: { orderBy: { createdAt: "asc" } },
              resources: { orderBy: { createdAt: "desc" } },
              timeEntries: { orderBy: { createdAt: "desc" } },
            },
          },
        },
      },
    },
  });

  if (!board) {
    board = await prisma.board.create({
      data: {
        name: "My Learning Board",
        userId: session.user.id,
        columns: {
          create: DEFAULT_COLUMNS,
        },
      },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                tags: { include: { tag: true } },
                subtasks: { orderBy: { createdAt: "asc" } },
                resources: { orderBy: { createdAt: "desc" } },
                timeEntries: { orderBy: { createdAt: "desc" } },
              },
            },
          },
        },
      },
    });
  }

  return JSON.parse(JSON.stringify(board));
}

export async function getAllTags() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const boardIds = boards.map((b) => b.id);

  const taskTags = await prisma.taskTag.findMany({
    where: { task: { boardId: { in: boardIds } } },
    include: { tag: true },
  });

  const uniqueTags = new Map<string, { id: string; name: string }>();
  for (const tt of taskTags) {
    if (!uniqueTags.has(tt.tag.id)) {
      uniqueTags.set(tt.tag.id, tt.tag);
    }
  }

  return Array.from(uniqueTags.values());
}
