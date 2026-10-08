import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, brand } from "@/content/site";
import { scrollToSection } from "./SmoothScroll";
import { LuxButton } from "./LuxButton";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navLinks.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4"
      >
        <nav
          aria-label="Main"
          className={`glass-strong mt-4 flex w-full max-w-6xl items-center justify-between rounded-full transition-all duration-500 ${
            scrolled ? "px-4 py-2 sm:px-5" : "px-5 py-3 sm:px-7"
          }`}
        >
          <button
            data-cursor="button"
            onClick={() => scrollToSection("hero")}
            className="group flex items-baseline gap-2"
            aria-label={`${brand.name} home`}
          >
            <span className="font-display text-lg font-extrabold tracking-tight transition-colors duration-500 group-hover:text-gold">
              DAS
            </span>
            <span className="text-gold">&amp;</span>
            <span className="font-display text-lg font-extrabold tracking-tight">CO</span>
          </button>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <li key={l.id}>
                <button
                  data-cursor="button"
                  onClick={() => go(l.id)}
                  className="relative rounded-full px-4 py-2 text-sm text-text-soft transition-colors duration-300 hover:text-gold"
                >
                  {l.label}
                  {active === l.id ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-4 -bottom-0.5 h-px bg-[image:var(--gradient-gold)]"
                    />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <LuxButton
              onClick={() => go("contact")}
              className="hidden px-6 py-2.5 text-xs sm:inline-flex"
            >
              Contact Us
            </LuxButton>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="glass rounded-full p-2.5 text-gold lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2">
              {navLinks.map((l, i) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go(l.id)}
                  className="font-display text-3xl font-extrabold tracking-tight text-foreground transition-colors hover:text-gold"
                >
                  {l.label}
                </motion.button>
              ))}
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-8 text-xs uppercase tracking-[0.3em] text-text-muted"
              >
                Studio Access
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
