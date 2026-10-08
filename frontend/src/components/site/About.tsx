import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import { images } from "@/content/site";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "./Reveal";

const points = [
  "Precision-driven CAD design",
  "Manufacturing-ready CAD files",
  "Uncompromising attention to detail",
  "Modern, revision-friendly workflow",
];

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="about" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center lg:gap-24">
        <div ref={ref} className="relative order-2 lg:order-1">
          <motion.div style={{ y }} className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-gold/8 blur-[80px]" />
            <div className="glass relative overflow-hidden rounded-[2rem] p-2" data-cursor="image">
              <motion.img
                src={images.cad}
                alt="A gold ring shown half as a CAD wireframe and half as a finished render"
                width={1200}
                height={1408}
                loading="eager"
                decoding="async"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-[1.6rem] object-cover transition-transform duration-[1.2s] hover:scale-[1.04]"
              />
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="About the Studio"
            title={
              <>
                Where jewelry <span className="text-gold-gradient">craftsmanship</span> meets
                digital precision
              </>
            }
            lead="DAS & CO exists for one reason — to give designers, brands and manufacturers CAD work they never have to question. Every model is built with the bench in mind, then finished with the patience of a jeweller."
          />

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl leading-relaxed text-text-muted">
              Our workflow blends genuine passion for jewellery with disciplined engineering:
              accurate stone seats, clean geometry, sensible wall thickness, and files that move
              straight into production without rework.
            </p>
          </Reveal>

          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
            {points.map((p) => (
              <StaggerItem
                key={p}
                className="glass flex items-start gap-3 rounded-2xl px-5 py-4 transition-colors duration-500 hover:border-gold/45"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                <span className="text-sm text-text-soft">{p}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
