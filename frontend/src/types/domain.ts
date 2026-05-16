export type Role = "ADMIN" | "MEMBER";
export type Status = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type User = { id: string; name: string; email: string; role: Role; createdAt: string };
export type ProjectMember = { id: string; projectId: string; userId: string; role: Role; user: User };
export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  projectId: string;
  assigneeId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  overdue: boolean;
  project?: Project;
  assignee: Pick<User, "id" | "name" | "email">;
  createdBy: Pick<User, "id" | "name" | "email">;
};
export type Project = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  members: ProjectMember[];
  tasks: Task[];
  currentUserProjectRole?: Role;
};
export type ApiResponse<T> = { success: true; data: T } | { success: false; message: string; errors?: unknown };
