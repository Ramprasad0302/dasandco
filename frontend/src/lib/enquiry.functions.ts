import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { brand } from "@/content/site";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(24),
  email: z.string().trim().email().max(160),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  projectType: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  // Honeypot — must stay empty. Bots fill it in.
  website: z.string().max(0).optional().or(z.literal("")),
});

let tableReady = false;
async function ensureEnquiriesTable(db: import("mysql2/promise").Pool) {
  if (tableReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(200) NOT NULL,
      company VARCHAR(160) NULL,
      project_type VARCHAR(120) NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  tableReady = true;
}

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };

    // Store the enquiry in the studio's own MySQL database — the same
    // one everything else in the app uses. (This form used to depend on
    // a Supabase project that was never configured, which is why every
    // submission was silently failing before an email could even go out.)
    const { getDb } = await import("@/lib/db.server");
    const db = getDb();
    await ensureEnquiriesTable(db);
    await db.query(
      `INSERT INTO enquiries (name, phone, email, company, project_type, message) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.phone, data.email, data.company || null, data.projectType || null, data.message]
    );

    // Email notification (best-effort — never blocks the visitor's confirmation).
    const key = process.env["RESEND_API_KEY"];
    if (key) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "DAS & CO <onboarding@resend.dev>",
            to: [brand.email],
            subject: `New enquiry — ${data.name}`,
            text: `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nCompany: ${data.company || "-"}\nProject: ${data.projectType || "-"}\n\n${data.message}`,
          }),
        });
      } catch {
        // swallow: the enquiry is already stored in the studio dashboard
      }
    }

    return { ok: true as const };
  });
