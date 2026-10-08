import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { portfolio, portfolioCategories } from "@/content/site";
import { SectionHeading } from "./Reveal";

export function Portfolio() {
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);

  const items = portfolio.filter((p) => filter === "All" || p.category === filter);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => ((i ?? 0) + 1) % items.length);
      if (e.key === "ArrowLeft") setOpen((i) => ((i ?? 0) - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, items.length]);

  const current = open !== null ? items[open] : undefined;

  return (
    <section id="portfolio" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Selected Work"
          title={
            <>
              A gallery of <span className="text-gold-gradient">finished intent</span>
            </>
          }
          lead="Renders produced from the same CAD files delivered to production. Nothing decorative — everything buildable."
        />

        <div className="mt-12 flex flex-wrap gap-2">
          {portfolioCategories.map((c) => (
            <button
              key={c}
              data-cursor="button"
              onClick={() => {
                setFilter(c);
                setOpen(null);
              }}
              className={`rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.16em] transition-all duration-400 ${
                filter === c
                  ? "border-gold/60 bg-gold/12 text-gold"
                  : "border-hairline text-text-muted hover:border-gold/40 hover:text-gold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <motion.div layout className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => (
              <motion.button
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setOpen(i)}
                data-cursor="portfolio"
                data-cursor-label="VIEW"
                aria-label={`View ${p.title}`}
                className="glass group mb-6 block w-full break-inside-avoid overflow-hidden rounded-[1.5rem] p-1.5 text-left transition-all duration-500 hover:border-gold/50 hover:shadow-[var(--shadow-gold)]"
              >
                <div className="relative overflow-hidden rounded-[1.2rem]">
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07] ${
                      p.span === "wide" ? "aspect-[4/3]" : "aspect-[3/4]"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-[0.6rem] uppercase tracking-[0.28em] text-gold">
                      {p.category}
                    </p>
                    <h3 className="mt-1.5 text-lg">{p.title}</h3>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {current ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/92 p-4 backdrop-blur-2xl sm:p-10"
            onClick={() => setOpen(null)}
          >
            <button
              onClick={() => setOpen(null)}
              aria-label="Close viewer"
              className="glass absolute right-5 top-5 rounded-full p-3 text-gold transition-colors hover:border-gold/60"
            >
              <X className="size-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => ((i ?? 0) - 1 + items.length) % items.length);
              }}
              aria-label="Previous design"
              className="glass absolute left-4 rounded-full p-3 text-gold sm:left-8"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => ((i ?? 0) + 1) % items.length);
              }}
              aria-label="Next design"
              className="glass absolute right-4 rounded-full p-3 text-gold sm:right-8"
            >
              <ChevronRight className="size-5" />
            </button>
            <motion.figure
              initial={{ scale: 0.92, opacity: 0, filter: "blur(14px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-h-[86svh] overflow-hidden rounded-[1.6rem] p-2"
            >
              <img
                src={current.src}
                alt={current.alt}
                className="max-h-[74svh] w-auto rounded-[1.2rem] object-contain"
              />
              <figcaption className="flex items-center justify-between px-3 py-3">
                <span className="text-sm">{current.title}</span>
                <span className="text-[0.6rem] uppercase tracking-[0.28em] text-gold">
                  {current.category}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
