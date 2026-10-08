import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Mail, MapPin } from "lucide-react";
import { brand, projectTypes } from "@/content/site";
import { Reveal, SectionHeading } from "./Reveal";
import { LuxButton } from "./LuxButton";

// Submits straight to Formspree from the browser — no dependency on our
// own server/database, so it keeps working no matter what's happening
// with hosting/env vars on our side.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeajalge";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z.string().trim().min(6, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email"),
  company: z.string().trim().optional(),
  projectType: z.string().trim().optional(),
  message: z.string().trim().min(10, "Tell us a little about the project"),
  website: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.24em] text-text-muted">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-hairline bg-glass px-4 py-3.5 text-sm text-foreground outline-none transition-all duration-400 placeholder:text-text-muted/60 focus:border-gold/70 focus:shadow-[0_0_0_4px_oklch(0.775_0.121_87.5/12%)]";

export function Contact() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    // Honeypot — bots fill this hidden field in. Pretend success, do nothing.
    if (values.website) {
      setSent(true);
      reset();
      return;
    }
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          company: values.company || "",
          projectType: values.projectType || "",
          message: values.message,
        }),
      });
      if (!res.ok) throw new Error("Formspree request failed");
      setSent(true);
      reset();
    } catch {
      setSent(false);
      alert("Something went wrong. Please email us directly at " + brand.email);
    }
  };

  return (
    <section id="contact" className="grain relative overflow-hidden py-28 mesh-bg sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <div>
          <SectionHeading
            eyebrow="Start a Project"
            title={
              <>
                Let's design
                <br />
                something <span className="text-gold-gradient">extraordinary</span>
              </>
            }
            lead="Share the concept, the metal and the timeline. We will respond with a clear plan for turning it into a production-ready CAD file."
          />

          <Reveal delay={0.1}>
            <ul className="mt-12 space-y-5">
              {[
                { Icon: Mail, label: brand.email, href: `mailto:${brand.email}` },
                { Icon: MapPin, label: brand.location },
              ].map(({ Icon, label, href }) => (
                <li key={label} className="flex items-center gap-4">
                  <span className="glass flex size-11 items-center justify-center rounded-xl text-gold">
                    <Icon className="size-4" />
                  </span>
                  {href ? (
                    <a
                      href={href}
                      data-cursor="button"
                      className="text-sm text-text-soft transition-colors hover:text-gold"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="text-sm text-text-soft">{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="glass-strong relative overflow-hidden rounded-[2rem] p-7 sm:p-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[26rem] flex-col items-center justify-center text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="flex size-16 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] text-background"
                  >
                    <Check className="size-7" />
                  </motion.span>
                  <h3 className="mt-7 text-2xl">Enquiry received</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
                    Thank you for contacting DAS &amp; CO. We will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-8 text-xs uppercase tracking-[0.28em] text-gold"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid gap-5 sm:grid-cols-2"
                  noValidate
                >
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="hidden"
                    {...register("website")}
                  />
                  <Field label="Name" error={errors.name?.message}>
                    <input className={inputClass} placeholder="Your name" {...register("name")} />
                  </Field>
                  <Field label="Phone Number" error={errors.phone?.message}>
                    <input
                      className={inputClass}
                      placeholder="+91 00000 00000"
                      {...register("phone")}
                    />
                  </Field>
                  <Field label="Email Address" error={errors.email?.message}>
                    <input
                      className={inputClass}
                      placeholder="you@studio.com"
                      {...register("email")}
                    />
                  </Field>
                  <Field label="Company (optional)">
                    <input className={inputClass} placeholder="Brand or studio" {...register("company")} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Project Type">
                      <select className={inputClass} defaultValue="" {...register("projectType")}>
                        <option value="" disabled>
                          Select a service
                        </option>
                        {projectTypes.map((p) => (
                          <option key={p} value={p} className="bg-popover">
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Message" error={errors.message?.message}>
                      <textarea
                        rows={5}
                        className={`${inputClass} resize-none`}
                        placeholder="Tell us about the piece, the metal, the stones and your timeline."
                        {...register("message")}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <LuxButton type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Sending
                        </>
                      ) : (
                        "Send Enquiry"
                      )}
                    </LuxButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
