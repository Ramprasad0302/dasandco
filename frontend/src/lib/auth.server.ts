import { hashPassword, verifyPassword } from "./password.server";
import { createUser, getUserByEmail } from "./user.server";
import { generateToken } from "./jwt.server";

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existing = await getUserByEmail(email);

  if (existing) {
    throw new Error("User already exists");
  }

  const hashed = await hashPassword(password);

  await createUser(name, email, hashed);

  return true;
}

export async function loginUser(
  email: string,
  password: string,
) {
  const user: any = await getUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  return {
    token: generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    }),
    user,
  };
}