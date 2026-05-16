import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { jwtSecret, TokenPayload } from "../utils/auth";
import { fail } from "../utils/responses";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string; role: "ADMIN" | "MEMBER"; createdAt: Date };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, "Authentication required", 401);

  try {
    const payload = jwt.verify(token, jwtSecret()) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    if (!user) return fail(res, "Invalid token", 401);
    req.user = user;
    next();
  } catch {
    return fail(res, "Invalid token", 401);
  }
};
