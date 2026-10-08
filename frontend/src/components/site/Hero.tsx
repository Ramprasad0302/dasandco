import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { images } from "@/content/site";
import { WordReveal } from "./Reveal";
import { LuxButton } from "./LuxButton";
import { scrollToSection } from "./SmoothScroll";

/** Deterministic particle field (no Math.random at module scope). */
function useParticles(count: number) {
  const [p] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: ((i * 37) % 100) + (i % 3),
      top: ((i * 61) % 100) + (i % 5),
      size: 1 + (i % 4) * 0.6,
      delay: (i % 9) * 0.7,
      dur: 7 + (i % 6),
      op: 0.15 + (i % 5) * 0.11,
    })),
  );
  return p;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const particles = useParticles(34);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (e: PointerEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      id="hero"
      ref={ref}
      className="grain relative flex min-h-[100svh] items-center overflow-hidden mesh-bg pt-28"
    >
      {/* moving light beams */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-beam absolute -left-1/4 top-0 h-[140%] w-[38rem] bg-[linear-gradient(90deg,transparent,oklch(0.775_0.121_87.5/7%),transparent)] blur-3xl" />
        <div
          className="animate-beam absolute right-0 top-0 h-[140%] w-[26rem] bg-[linear-gradient(90deg,transparent,oklch(0.855_0.101_90/6%),transparent)] blur-3xl"
          style={{ animationDelay: "4s" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(oklch(1_0_0/2%)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/2%)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" />
        {particles.map((p, i) => (
          <span
            key={i}
            className="animate-float absolute rounded-full bg-gold"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              opacity: p.op,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              boxShadow: "0 0 10px var(--gold)",
            }}
          />
        ))}
      </div>

      <motion.div
        style={{ y, opacity: fade }}
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8"
      >
        <div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.9 }}
            className="eyebrow"
          >
            Luxury Jewelry CAD Design Studio
          </motion.p>

          <h1 className="mt-7 text-[clamp(2.75rem,7.4vw,6.25rem)] font-black leading-[0.95]">
            <WordReveal text="Designing Jewelry" delay={0.25} />
            <span className="block text-gold-gradient">
              <WordReveal text="Beyond Imagination" delay={0.55} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.05, duration: 1 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg"
          >
            DAS &amp; CO is a precision-driven jewelry CAD studio. We translate ideas into
            manufacturing-ready digital craftsmanship — engineered to the millimetre, presented
            like a masterpiece.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-11 flex flex-wrap items-center gap-4"
          >
            <LuxButton onClick={() => scrollToSection("contact")}>
              Contact Us <ArrowUpRight className="size-4" />
            </LuxButton>
            <LuxButton variant="ghost" onClick={() => scrollToSection("portfolio")}>
              Explore Portfolio
            </LuxButton>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-8"
          >
            {[
              ["Precision", "0.01 mm"],
              ["Delivery", "Production-ready"],
              ["Focus", "Detail first"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.65rem] uppercase tracking-[0.24em] text-text-muted">{k}</dt>
                <dd className="mt-2 font-display text-base text-gold">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, filter: "blur(16px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            transform: `perspective(1200px) rotateY(${mouse.x * 5}deg) rotateX(${-mouse.y * 5}deg)`,
          }}
          className="relative mx-auto w-full max-w-md transition-transform duration-300 ease-out"
        >
          <div className="absolute -inset-10 rounded-full bg-gold/12 blur-[90px]" />
          <div className="glass relative overflow-hidden rounded-[2rem] p-2" data-cursor="image">
            <img
              src={images.ring}
              alt="Photorealistic CAD render of a diamond solitaire ring in gold"
              width={1408}
              height={1600}
              fetchPriority="high"
              className="h-full w-full rounded-[1.6rem] object-cover"
            />
          </div>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={() => scrollToSection("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        aria-label="Scroll to about"
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-gold/70 transition-colors hover:text-gold"
      >
        <ArrowDown className="size-5 animate-bounce" />
      </motion.button>
    </section>
  );
}
