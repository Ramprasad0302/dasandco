import { useRef, type PointerEvent } from "react";
import { Gem, Sparkles, Box, Ruler, Compass, type LucideIcon } from "lucide-react";
import { services } from "@/content/site";
import { SectionHeading, Stagger, StaggerItem } from "./Reveal";

const icons: Record<string, LucideIcon> = { Gem, Sparkles, Box, Ruler, Compass };

function ServiceCard({ s, index }: { s: (typeof services)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = icons[s.icon] ?? Gem;

  // 3D tilt + mouse-follow light, applied straight to transform for GPU compositing.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 8}deg) rotateX(${(0.5 - py) * 8}deg) translateY(-6px)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
  };

  return (
    <StaggerItem className={index === 0 ? "lg:col-span-2" : ""}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-cursor="button"
        className="glass group relative h-full overflow-hidden rounded-[1.75rem] p-8 transition-[transform,border-color,box-shadow] duration-500 hover:border-gold/50 hover:shadow-[var(--shadow-gold)] sm:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(20rem 20rem at var(--mx,50%) var(--my,50%), oklch(0.775 0.121 87.5 / 12%), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-hairline bg-gold/10 text-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6">
            <Icon className="size-5" />
          </div>
          <h3 className="mt-7 text-2xl sm:text-[1.7rem]">{s.title}</h3>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-muted">{s.copy}</p>
          <ul className="mt-7 grid gap-2 sm:grid-cols-2">
            {s.points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-text-soft">
                <span className="size-1 rounded-full bg-gold" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </StaggerItem>
  );
}

export function Services() {
  return (
    <section id="services" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Capabilities"
          title={
            <>
              A catalogue of <span className="text-gold-gradient">precision</span> services
            </>
          }
          lead="Five disciplines, one standard. Each engagement is handled as a single continuous craft — from first sketch to the file your manufacturer opens."
        />

        <Stagger className="mt-16 grid gap-6 lg:grid-cols-2">
          {services.map((s, i) => (
            <ServiceCard key={s.title} s={s} index={i} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}
