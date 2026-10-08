import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { pillars } from "@/content/site";
import { SectionHeading } from "./Reveal";

export function WhyUs() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const line = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  return (
    <section id="why" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Why DAS & CO"
          title={
            <>
              Five reasons the work
              <br />
              <span className="text-gold-gradient">holds its value</span>
            </>
          }
        />

        <div ref={ref} className="relative mt-20">
          <div className="absolute left-0 top-0 hidden h-full w-px bg-hairline lg:block">
            <motion.div
              style={{ height: line }}
              className="w-px bg-[image:var(--gradient-gold)]"
            />
          </div>

          <div className="lg:pl-16">
            {pillars.map((p, i) => (
              <motion.article
                key={p.n}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-18%" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="group grid gap-4 border-b border-hairline py-10 sm:grid-cols-[auto_1fr] sm:gap-12 lg:py-14"
              >
                <span className="font-display text-5xl font-black leading-none text-gold/25 transition-colors duration-500 group-hover:text-gold/60 sm:text-7xl">
                  {p.n}
                </span>
                <div className="max-w-2xl">
                  <h3 className="text-3xl transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl">
                    {p.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-text-muted">{p.copy}</p>
                </div>
                <span className="sr-only">{i + 1}</span>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
