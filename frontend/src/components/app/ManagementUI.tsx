import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-serif text-[2.2rem] leading-none tracking-[-0.035em] text-[#f5f1ea] sm:text-[2.7rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a8a19a]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = false,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="studio-card group min-h-[126px] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b99542]/45">
      <div className="flex items-start justify-between gap-3">
        <p className="studio-label">{label}</p>
        {icon && <span className="text-[#c7a34c]">{icon}</span>}
      </div>
      <p className={`mt-4 font-serif text-[1.65rem] leading-none ${accent ? "text-[#c7a34c]" : "text-[#f5f1ea]"}`}>
        {value}
      </p>
      {sub && <p className="mt-2 text-xs text-[#817a73]">{sub}</p>}
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
  width = "max-w-[560px]",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  const node = (
    <div className="studio-modal-portal fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className={`studio-modal ${width} w-full`}>
        <div className="flex items-center justify-between border-b border-[#3b3020] px-6 py-5">
          <h3 className="font-serif text-[1.55rem] text-[#f5f1ea]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#aaa29a] transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  // Rendered via a portal straight onto <body> so it always covers the
  // true viewport — the studio shell can have a CSS `filter` on it (for
  // the light-mode flip), and a `filter` on an ancestor would otherwise
  // turn this fixed-position overlay into one that scrolls with the page.
  return typeof document !== "undefined" ? createPortal(node, document.body) : node;
}

export function StudioButton({
  children,
  variant = "gold",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "outline" | "ghost";
}) {
  const styles = {
    gold: "bg-[#e5b947] text-[#17120b] hover:bg-[#f0ca62]",
    outline: "border border-[#4b3c24] bg-transparent text-[#eee8de] hover:border-[#c7a34c]/60 hover:bg-[#c7a34c]/5",
    ghost: "bg-transparent text-[#c7a34c] hover:bg-[#c7a34c]/8",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function StudioInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { suffix?: string }
) {
  const { suffix, className, ...rest } = props;
  if (suffix) {
    return (
      <div className="relative">
        <input
          {...rest}
          className={`studio-input pr-9 ${className || ""}`}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8f877e]">
          {suffix}
        </span>
      </div>
    );
  }
  return (
    <input
      {...rest}
      className={`studio-input ${className || ""}`}
    />
  );
}

export function StudioField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="studio-label mb-2">{label}</p>
      {children}
    </div>
  );
}

export function StudioSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={`studio-input ${props.className || ""}`}
    />
  );
}

export function StudioTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`studio-input min-h-[110px] resize-y ${props.className || ""}`}
    />
  );
}

export function formatGold(value: unknown) {
  return `${Number(value || 0).toFixed(3)} g`;
}

export function formatINR(value: unknown) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

// Formats a date as DD/MM/YYYY, e.g. 09/08/2026 — used everywhere in the app.
export function formatDate(value: unknown) {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Kept as an alias for older call sites — same DD/MM/YYYY format.
export const formatDateSlash = formatDate;
