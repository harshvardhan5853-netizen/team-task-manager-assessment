import jwt from "jsonwebtoken";

export type TokenPayload = { userId: string };

export const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return secret;
};

export const signToken = (userId: string) => jwt.sign({ userId }, jwtSecret(), { expiresIn: "7d" });
