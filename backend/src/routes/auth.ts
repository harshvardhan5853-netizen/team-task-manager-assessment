import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { signToken } from "../utils/auth";
import { ok, fail } from "../utils/responses";
import { validate } from "../utils/validation";

const router = Router();

const publicUser = { id: true, name: true, email: true, role: true, createdAt: true };

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8)
  }),
  query: z.object({}).passthrough(),
  params: z.object({})
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1)
  }),
  query: z.object({}).passthrough(),
  params: z.object({})
});

router.post("/signup", validate(signupSchema), async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) return fail(res, "Email is already registered", 409);

  const password = await bcrypt.hash(req.body.password, 10);
  const user = await prisma.user.create({
    data: { name: req.body.name, email: req.body.email, password },
    select: publicUser
  });

  return ok(res, { token: signToken(user.id), user }, 201);
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return fail(res, "Invalid email or password", 401);

  const matches = await bcrypt.compare(req.body.password, user.password);
  if (!matches) return fail(res, "Invalid email or password", 401);

  const { password: _password, ...safeUser } = user;
  return ok(res, { token: signToken(user.id), user: safeUser });
});

router.get("/me", requireAuth, async (req, res) => ok(res, req.user));

export default router;
