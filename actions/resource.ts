"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addResource(taskId: string, url: string, title?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const resource = await prisma.resource.create({
    data: { taskId, url, title },
  });

  revalidatePath("/board");
  return resource;
}

export async function removeResource(resourceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.resource.delete({ where: { id: resourceId } });
  revalidatePath("/board");
}
