import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { processSteps, technology } from "@/content/site";
import { SectionHeading, Stagger, StaggerItem } from "./Reveal";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="The Process"
          title={
            <>
              From idea to <span className="text-gold-gradient">production file</span>
            </>
          }
        />

        <div ref={ref} className="relative mt-20">
          <div className="absolute left-[15px] top-0 hidden h-full w-px bg-hairline sm:block lg:left-0 lg:top-[15px] lg:h-px lg:w-full">
            <motion.div
              style={{ height, width: "1px" }}
              className="bg-[image:var(--gradient-gold)] lg:hidden"
            />
            <motion.div
              style={{ width }}
              className="hidden h-px bg-[image:var(--gradient-gold)] lg:block"
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
            {processSteps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-12 sm:pl-14 lg:pl-0 lg:pt-14"
              >
                <span className="absolute left-0 top-1 size-[31px] rounded-full border border-gold/45 bg-background lg:top-0" />
                <span className="absolute left-[11px] top-3 size-2.5 rounded-full bg-gold shadow-[0_0_14px_var(--gold)] lg:top-[11px]" />
                <p className="font-display text-sm tracking-[0.3em] text-gold">{s.n}</p>
                <h3 className="mt-3 text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{s.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Technology() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Technology"
          title={
            <>
              Modern tools, <span className="text-gold-gradient">jeweller's discipline</span>
            </>
          }
          align="center"
        />
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {technology.map((t) => (
            <StaggerItem
              key={t.title}
              className="glass group rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50"
            >
              <div className="hairline-x mb-5 w-10 transition-all duration-500 group-hover:w-full" />
              <h3 className="text-base leading-snug">{t.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{t.copy}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
