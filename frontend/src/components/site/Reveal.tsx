import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const base: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={base}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  gap = 0.09,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={base}>
      {children}
    </motion.div>
  );
}

/** Word-by-word headline reveal. */
export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1.1,
              delay: delay + i * 0.085,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h2>
      {lead ? (
        <p className="mt-6 text-base leading-relaxed text-text-muted sm:text-lg">{lead}</p>
      ) : null}
    </Reveal>
  );
}
