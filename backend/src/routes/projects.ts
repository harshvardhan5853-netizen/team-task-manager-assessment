import { ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { fail, ok } from "../utils/responses";
import { validate } from "../utils/validation";
import { getMembership, isProjectAdmin } from "../utils/projectAccess";

const router = Router();
router.use(requireAuth);

const paramsId = z.object({ id: z.string().min(1) });
const createProjectSchema = z.object({
  body: z.object({ name: z.string().min(2), description: z.string().min(1) }),
  query: z.object({}).passthrough(),
  params: z.object({})
});
const updateProjectSchema = z.object({
  body: z.object({ name: z.string().min(2).optional(), description: z.string().min(1).optional() }).refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  query: z.object({}).passthrough(),
  params: paramsId
});
const addMemberSchema = z.object({
  body: z.object({ email: z.string().email().toLowerCase(), role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER) }),
  query: z.object({}).passthrough(),
  params: paramsId
});
const removeMemberSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1), userId: z.string().min(1) })
});
const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(1),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
    dueDate: z.coerce.date(),
    assigneeId: z.string().min(1)
  }),
  query: z.object({}).passthrough(),
  params: paramsId
});
const taskListSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignee: z.string().optional()
  }),
  params: paramsId
});
const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(1).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.coerce.date().optional(),
    assigneeId: z.string().min(1).optional()
  }).refine((v) => Object.keys(v).length > 0, "At least one field is required"),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1), taskId: z.string().min(1) })
});
const taskParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1), taskId: z.string().min(1) })
});

const includeProject = {
  owner: { select: { id: true, name: true, email: true } },
  members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
  tasks: {
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" as const }
  }
};

const withOverdue = <T extends { dueDate: Date; status: TaskStatus }>(task: T) => ({
  ...task,
  overdue: task.dueDate < new Date() && task.status !== TaskStatus.DONE
});

router.post("/", validate(createProjectSchema), async (req, res) => {
  const project = await prisma.project.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      ownerId: req.user!.id,
      members: { create: { userId: req.user!.id, role: ProjectRole.ADMIN } }
    },
    include: includeProject
  });
  return ok(res, project, 201);
});

router.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.user!.id } } },
    include: includeProject,
    orderBy: { createdAt: "desc" }
  });
  return ok(res, projects.map((p) => ({ ...p, tasks: p.tasks.map(withOverdue) })));
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);
  const membership = await getMembership(id, req.user!.id);
  if (!membership) return fail(res, "Project not found", 404);
  const project = await prisma.project.findUnique({ where: { id }, include: includeProject });
  if (!project) return fail(res, "Project not found", 404);
  return ok(res, { ...project, tasks: project.tasks.map(withOverdue), currentUserProjectRole: membership.role });
});

router.put("/:id", validate(updateProjectSchema), async (req, res) => {
  const id = String(req.params.id);
  if (!(await isProjectAdmin(id, req.user!.id))) return fail(res, "Project admin access required", 403);
  const project = await prisma.project.update({ where: { id }, data: req.body, include: includeProject });
  return ok(res, project);
});

router.delete("/:id", async (req, res) => {
  const id = String(req.params.id);
  if (!(await isProjectAdmin(id, req.user!.id))) return fail(res, "Project admin access required", 403);
  await prisma.project.delete({ where: { id } });
  return ok(res, { id });
});

router.post("/:id/members", validate(addMemberSchema), async (req, res) => {
  const id = String(req.params.id);
  if (!(await isProjectAdmin(id, req.user!.id))) return fail(res, "Project admin access required", 403);
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return fail(res, "User with that email was not found", 404);
  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: id, userId: user.id } },
    update: { role: req.body.role },
    create: { projectId: id, userId: user.id, role: req.body.role },
    include: { user: { select: { id: true, name: true, email: true, role: true } } }
  });
  return ok(res, member, 201);
});

router.delete("/:id/members/:userId", validate(removeMemberSchema), async (req, res) => {
  const id = String(req.params.id);
  const userId = String(req.params.userId);
  if (!(await isProjectAdmin(id, req.user!.id))) return fail(res, "Project admin access required", 403);
  const admins = await prisma.projectMember.count({ where: { projectId: id, role: ProjectRole.ADMIN } });
  const target = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: id, userId } } });
  if (!target) return fail(res, "Member not found", 404);
  if (target.role === ProjectRole.ADMIN && admins <= 1) return fail(res, "Project must keep at least one admin", 400);
  await prisma.projectMember.delete({ where: { projectId_userId: { projectId: id, userId } } });
  return ok(res, { userId });
});

router.post("/:id/tasks", validate(createTaskSchema), async (req, res) => {
  const id = String(req.params.id);
  const membership = await getMembership(id, req.user!.id);
  if (!membership) return fail(res, "Project member access required", 403);
  const assignee = await getMembership(id, req.body.assigneeId);
  if (!assignee) return fail(res, "Assignee must be a project member", 422);
  const task = await prisma.task.create({
    data: { ...req.body, projectId: id, createdById: req.user!.id },
    include: { assignee: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } }, project: true }
  });
  return ok(res, withOverdue(task), 201);
});

router.get("/:id/tasks", validate(taskListSchema), async (req, res) => {
  const id = String(req.params.id);
  const membership = await getMembership(id, req.user!.id);
  if (!membership) return fail(res, "Project member access required", 403);
  const { status, priority, assignee } = req.query as { status?: TaskStatus; priority?: TaskPriority; assignee?: string };
  const tasks = await prisma.task.findMany({
    where: { projectId: id, status, priority, assigneeId: assignee },
    include: { assignee: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } }, project: true },
    orderBy: { createdAt: "desc" }
  });
  return ok(res, tasks.map(withOverdue));
});

router.put("/:id/tasks/:taskId", validate(updateTaskSchema), async (req, res) => {
  const id = String(req.params.id);
  const taskId = String(req.params.taskId);
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== id) return fail(res, "Task not found", 404);
  const admin = await isProjectAdmin(id, req.user!.id);
  if (!admin && task.assigneeId !== req.user!.id) return fail(res, "Task assignee or project admin access required", 403);
  if (req.body.assigneeId && !(await getMembership(id, req.body.assigneeId))) return fail(res, "Assignee must be a project member", 422);
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: req.body,
    include: { assignee: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } }, project: true }
  });
  return ok(res, withOverdue(updated));
});

router.delete("/:id/tasks/:taskId", validate(taskParamsSchema), async (req, res) => {
  const id = String(req.params.id);
  const taskId = String(req.params.taskId);
  if (!(await isProjectAdmin(id, req.user!.id))) return fail(res, "Project admin access required", 403);
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== id) return fail(res, "Task not found", 404);
  await prisma.task.delete({ where: { id: taskId } });
  return ok(res, { id: taskId });
});

export default router;
