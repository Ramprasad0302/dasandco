import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}