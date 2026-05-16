import bcrypt from "bcrypt";
import { PrismaClient, ProjectRole, TaskPriority, TaskStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const memberPassword = await bcrypt.hash("Member123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "Avery Admin", email: "admin@example.com", password: adminPassword, role: UserRole.ADMIN }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: { name: "Morgan Member", email: "member@example.com", password: memberPassword, role: UserRole.MEMBER }
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project" },
    update: {},
    create: {
      id: "seed-project",
      name: "Launch Operations",
      description: "Coordinate launch tasks across design, engineering, and support.",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: ProjectRole.ADMIN },
          { userId: member.id, role: ProjectRole.MEMBER }
        ]
      }
    }
  });

  await prisma.task.deleteMany({ where: { projectId: project.id } });
  const now = Date.now();
  await prisma.task.createMany({
    data: [
      { title: "Finalize onboarding flow", description: "Review copy and edge states.", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDate: new Date(now + 86400000), projectId: project.id, assigneeId: member.id, createdById: admin.id },
      { title: "Create launch checklist", description: "Document release readiness criteria.", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDate: new Date(now + 172800000), projectId: project.id, assigneeId: admin.id, createdById: admin.id },
      { title: "Resolve billing copy", description: "Align settings page terminology.", status: TaskStatus.TODO, priority: TaskPriority.LOW, dueDate: new Date(now - 86400000), projectId: project.id, assigneeId: member.id, createdById: admin.id },
      { title: "Ship status dashboard", description: "Publish internal metrics view.", status: TaskStatus.DONE, priority: TaskPriority.HIGH, dueDate: new Date(now - 172800000), projectId: project.id, assigneeId: admin.id, createdById: admin.id },
      { title: "Invite beta users", description: "Add initial customer cohort.", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, dueDate: new Date(now + 259200000), projectId: project.id, assigneeId: member.id, createdById: admin.id }
    ]
  });
}

main().finally(async () => prisma.$disconnect());
