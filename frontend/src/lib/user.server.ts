import { getDb } from "./db.server";

export async function getUserByEmail(email: string) {
  const db = getDb();

  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  return Array.isArray(rows) ? rows[0] : null;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role = "admin",
) {
  const db = getDb();

  const [result] = await db.execute(
    `INSERT INTO users (name,email,password,role)
     VALUES (?,?,?,?)`,
    [name, email, password, role],
  );

  return result;
}