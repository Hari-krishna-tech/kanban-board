"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logTime(taskId: string, minutes: number, note?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const entry = await prisma.timeEntry.create({
    data: { taskId, minutes, note },
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { timeSpent: { increment: minutes } },
  });

  revalidatePath("/board");
  return entry;
}
