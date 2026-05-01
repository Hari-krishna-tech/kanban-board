"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTag(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const tag = await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  revalidatePath("/board");
  return tag;
}

export async function addTagToTask(taskId: string, tagId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.taskTag.create({
    data: { taskId, tagId },
  });

  revalidatePath("/board");
}

export async function removeTagFromTask(taskId: string, tagId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.taskTag.delete({
    where: { taskId_tagId: { taskId, tagId } },
  });

  revalidatePath("/board");
}
