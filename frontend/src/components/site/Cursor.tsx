import { useEffect, useRef, useState } from "react";

/**
 * Luxury cursor: a gold dot with a lagging, velocity-stretched ring.
 * Pure rAF + GPU transforms; auto-disabled on touch devices and reduced motion.
 * Elements opt into states with `data-cursor="button|image|portfolio|contact"`
 * and an optional `data-cursor-label`.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [variant, setVariant] = useState<string>("default");

  useEffect(() => {
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (touch || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("no-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let vx = 0;
    let vy = 0;
    let raf = 0;

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (el) {
        setVariant(el.dataset["cursor"] ?? "default");
        setLabel(el.dataset["cursorLabel"] ?? "");
      } else {
        setVariant("default");
        setLabel("");
      }
    };

    const tick = () => {
      const prevX = pos.x;
      const prevY = pos.y;
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      vx = pos.x - prevX;
      vy = pos.y - prevY;
      const speed = Math.min(Math.hypot(vx, vy) / 22, 0.5);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${1 + speed}, ${1 - speed * 0.6})`;
      }
      raf = requestAnimationFrame(tick);
    };

    const click = () => {
      if (!ring.current) return;
      ring.current.animate(
        [
          { boxShadow: "0 0 0 0 oklch(0.775 0.121 87.5 / 45%)" },
          { boxShadow: "0 0 0 26px oklch(0.775 0.121 87.5 / 0%)" },
        ],
        { duration: 550, easing: "cubic-bezier(0.16,1,0.3,1)" },
      );
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      document.documentElement.classList.remove("no-cursor");
    };
  }, []);

  if (!enabled) return null;

  const size =
    variant === "button" ? 76 : variant === "portfolio" ? 96 : variant === "image" ? 84 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={dot}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-gold"
        style={{ boxShadow: "0 0 12px var(--gold)" }}
      />
      <div
        ref={ring}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border border-gold/60 text-[10px] font-medium uppercase tracking-[0.22em] text-gold transition-[width,height,border-radius,background-color] duration-300"
        style={{
          width: size,
          height: size,
          borderRadius: variant === "portfolio" ? 8 : 999,
          backgroundColor: variant === "default" ? "transparent" : "oklch(0.775 0.121 87.5 / 10%)",
          boxShadow: "0 0 28px oklch(0.775 0.121 87.5 / 22%)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
