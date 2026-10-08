import { Link } from "@tanstack/react-router";
import { Globe, Share2, Mail } from "lucide-react";
import { brand, navLinks } from "@/content/site";
import { scrollToSection } from "./SmoothScroll";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline pt-20">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-display text-[clamp(3rem,13vw,10rem)] font-black leading-none tracking-tighter text-gold/12">
            DAS &amp; CO
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 border-t border-hairline py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg">{brand.name}</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">{brand.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h3 className="text-sm uppercase tracking-[0.24em] text-gold">Navigate</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <button
                    data-cursor="button"
                    onClick={() => scrollToSection(l.id)}
                    className="text-sm text-text-muted transition-colors duration-300 hover:text-gold"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm uppercase tracking-[0.24em] text-gold">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-muted">
              <li>
                <a href={`mailto:${brand.email}`} className="transition-colors hover:text-gold">
                  {brand.email}
                </a>
              </li>
              <li>{brand.location}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-[0.24em] text-gold">Follow</h3>
            <div className="mt-4 flex gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href={i === 2 ? `mailto:${brand.email}` : "#"}
                  aria-label={["Instagram", "LinkedIn", "Email"][i]}
                  data-cursor="button"
                  className="glass flex size-10 items-center justify-center rounded-xl text-gold transition-all duration-400 hover:-translate-y-1 hover:border-gold/60"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
            <Link
              to="/auth"
              className="mt-6 inline-block text-[0.65rem] uppercase tracking-[0.28em] text-text-muted transition-colors hover:text-gold"
            >
              Studio Access
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline py-7 text-xs text-text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p>
            Designed by{" "}
            <a
              href="https://nirmaandigital.com"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="button"
              className="relative text-gold transition-all duration-400 hover:text-gold-light hover:drop-shadow-[0_0_10px_oklch(0.775_0.121_87.5/60%)]"
            >
              Nirmaan Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
