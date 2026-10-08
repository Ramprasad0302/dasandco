import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { testimonials, faqs } from "@/content/site";
import { SectionHeading } from "./Reveal";

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = testimonials[i]!;

  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading eyebrow="Client Voices" title="Trusted at the bench" align="center" />

        <div className="glass relative mt-14 overflow-hidden rounded-[2rem] p-10 sm:p-16">
          <Quote className="size-9 text-gold/40" />
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6"
            >
              <p className="font-display text-2xl leading-snug sm:text-[2rem]">"{t.quote}"</p>
              <footer className="mt-8 text-sm text-text-muted">
                <span className="text-gold">{t.name}</span> — {t.role}
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-3">
            <button
              data-cursor="button"
              aria-label="Previous testimonial"
              onClick={() => setI((v) => (v - 1 + testimonials.length) % testimonials.length)}
              className="glass rounded-full p-3 text-gold transition-colors hover:border-gold/60"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              data-cursor="button"
              aria-label="Next testimonial"
              onClick={() => setI((v) => (v + 1) % testimonials.length)}
              className="glass rounded-full p-3 text-gold transition-colors hover:border-gold/60"
            >
              <ArrowRight className="size-4" />
            </button>
            <span className="ml-2 text-xs tracking-[0.24em] text-text-muted">
              {String(i + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Questions"
          title={
            <>
              Everything you
              <br />
              <span className="text-gold-gradient">might ask</span>
            </>
          }
        />

        <div className="divide-y divide-[color:var(--hairline)] border-y border-hairline">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  data-cursor="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                >
                  <span
                    className={`font-display text-lg transition-colors duration-400 sm:text-xl ${isOpen ? "text-gold" : "group-hover:text-gold"}`}
                  >
                    {f.q}
                  </span>
                  <Plus
                    className={`size-5 shrink-0 text-gold transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 pr-10 leading-relaxed text-text-muted">{f.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
