"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addSubtask(taskId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const subtask = await prisma.subtask.create({
    data: { title, taskId },
  });

  revalidatePath("/board");
  return subtask;
}

export async function toggleSubtask(subtaskId: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: { completed },
  });

  revalidatePath("/board");
}

export async function deleteSubtask(subtaskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.subtask.delete({ where: { id: subtaskId } });
  revalidatePath("/board");
}
