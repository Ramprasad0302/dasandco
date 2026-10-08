import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: -80, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Lenis-powered momentum scrolling; skipped when the user prefers reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.09 });
    lenisInstance = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
