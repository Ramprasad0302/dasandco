import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "ghost";
  children: ReactNode;
};

/** Magnetic-feeling gold CTA with a sheen sweep and press micro-bounce. */
export const LuxButton = forwardRef<HTMLButtonElement, Props>(function LuxButton(
  { variant = "gold", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      data-cursor="button"
      className={cn(
        "shine group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium tracking-wide transition-all duration-500 active:scale-[0.97]",
        variant === "gold"
          ? "bg-[image:var(--gradient-gold)] text-background shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-18px_oklch(0.775_0.121_87.5/60%)]"
          : "glass text-foreground hover:-translate-y-0.5 hover:border-gold/50 hover:text-gold",
        className,
      )}
      {...rest}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});
