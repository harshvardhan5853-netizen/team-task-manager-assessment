import { ProjectRole } from "@prisma/client";
import { prisma } from "../prisma";

export const getMembership = (projectId: string, userId: string) =>
  prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });

export const isProjectAdmin = async (projectId: string, userId: string) => {
  const membership = await getMembership(projectId, userId);
  return membership?.role === ProjectRole.ADMIN;
};
