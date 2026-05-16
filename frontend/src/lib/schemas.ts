import { z } from "zod";

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const signupSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
export const projectSchema = z.object({ name: z.string().min(2), description: z.string().min(1) });
export const memberSchema = z.object({ email: z.string().email() });
export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().min(1),
  assigneeId: z.string().min(1)
});
