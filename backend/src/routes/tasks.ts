import { Router } from "express";
import { TaskStatus } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../prisma";
import { ok } from "../utils/responses";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { project: { members: { some: { userId: req.user!.id } } } },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const now = new Date();
  const data = tasks.map((task) => ({ ...task, overdue: task.dueDate < now && task.status !== TaskStatus.DONE }));
  const stats = {
    total: data.length,
    inProgress: data.filter((task) => task.status === TaskStatus.IN_PROGRESS).length,
    completed: data.filter((task) => task.status === TaskStatus.DONE).length,
    overdue: data.filter((task) => task.overdue).length
  };
  const byStatus = Object.values(TaskStatus).map((status) => ({ status, count: data.filter((task) => task.status === status).length }));

  return ok(res, { stats, byStatus, tasks: data });
});

export default router;
