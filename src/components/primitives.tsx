'use client';

import { type ReactNode } from "react";
import { Star, X, CheckCircle2, AlertCircle, Info, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ===================================================================
   SECTION HEADER — Premium heading with animated accent bar
   =================================================================== */

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span
            className="block h-5 w-1 rounded-full"
            style={{ background: "linear-gradient(to bottom, #6366f1, #22d3ee)" }}
          />
          <h2
            className="font-display text-xl sm:text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="mt-1 text-sm pl-4" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ===================================================================
   STAT CARD — 3D hover, glow icon, accent bar
   =================================================================== */

const accentStyles: Record<string, { icon: string; border: string; glow: string; dot: string }> = {
  indigo: {
    icon: "color: #818cf8; background: rgba(99,102,241,0.12); box-shadow: 0 0 16px rgba(99,102,241,0.25)",
    border: "border-left: 3px solid #6366f1",
    glow: "rgba(99,102,241,0.2)",
    dot: "#6366f1",
  },
  cyan: {
    icon: "color: #67e8f9; background: rgba(34,211,238,0.12); box-shadow: 0 0 16px rgba(34,211,238,0.25)",
    border: "border-left: 3px solid #22d3ee",
    glow: "rgba(34,211,238,0.2)",
    dot: "#22d3ee",
  },
  violet: {
    icon: "color: #c084fc; background: rgba(168,85,247,0.12); box-shadow: 0 0 16px rgba(168,85,247,0.25)",
    border: "border-left: 3px solid #a855f7",
    glow: "rgba(168,85,247,0.2)",
    dot: "#a855f7",
  },
  emerald: {
    icon: "color: #34d399; background: rgba(16,185,129,0.12); box-shadow: 0 0 16px rgba(16,185,129,0.25)",
    border: "border-left: 3px solid #10b981",
    glow: "rgba(16,185,129,0.2)",
    dot: "#10b981",
  },
  amber: {
    icon: "color: #fbbf24; background: rgba(245,158,11,0.12); box-shadow: 0 0 16px rgba(245,158,11,0.25)",
    border: "border-left: 3px solid #f59e0b",
    glow: "rgba(245,158,11,0.2)",
    dot: "#f59e0b",
  },
  red: {
    icon: "color: #f87171; background: rgba(239,68,68,0.12); box-shadow: 0 0 16px rgba(239,68,68,0.25)",
    border: "border-left: 3px solid #ef4444",
    glow: "rgba(239,68,68,0.2)",
    dot: "#ef4444",
  },
};

const accentMap: Record<string, string> = {
  indigo: "text-[var(--accent-indigo-bright)] bg-[var(--accent-indigo)]/10 ring-[var(--accent-indigo)]/20",
  cyan: "text-[var(--accent-cyan-bright)] bg-[var(--accent-cyan)]/10 ring-[var(--accent-cyan)]/20",
  violet: "text-[var(--accent-violet-bright)] bg-[var(--accent-violet)]/10 ring-[var(--accent-violet)]/20",
  emerald: "text-[var(--accent-emerald-bright)] bg-[var(--accent-emerald)]/10 ring-[var(--accent-emerald)]/20",
  amber: "text-[var(--accent-amber-bright)] bg-[var(--accent-amber)]/10 ring-[var(--accent-amber)]/20",
  red: "text-[var(--accent-red-bright)] bg-[var(--accent-red)]/10 ring-[var(--accent-red)]/20",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "indigo",
  badge,
  footer,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  accent?: keyof typeof accentStyles;
  badge?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const style = accentStyles[accent] || accentStyles.indigo;

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] } }}
      className={cn("relative overflow-hidden rounded-2xl flex flex-col gap-3 p-5 group", className)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-bright)",
        borderLeft: `3px solid ${style.dot}`,
      }}
    >
      {/* Subtle hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 20%, ${style.glow}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between relative">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ cssText: style.icon } as React.CSSProperties}
        >
          <Icon size={20} strokeWidth={2} />
        </span>
        {badge}
      </div>

      <div className="relative">
        <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="mt-1 stat-number" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>

      {footer && <div className="relative mt-auto">{footer}</div>}
    </motion.div>
  );
}

/* ===================================================================
   STATUS BADGE — Pill tag with color + ring glow
   =================================================================== */

const badgeMap: Record<string, string> = {
  ...accentMap,
  neutral: "text-[var(--text-muted)] bg-white/5 ring-white/10",
};

export function StatusBadge({
  variant,
  children,
}: {
  variant: "indigo" | "cyan" | "violet" | "emerald" | "amber" | "red" | "neutral";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        badgeMap[variant]
      )}
    >
      {children}
    </span>
  );
}

/* ===================================================================
   RATING STARS — Amber stars with count
   =================================================================== */

export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
      <div className="flex items-center" style={{ color: "var(--accent-amber)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < Math.round(rating) ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="font-bold text-[11px]" style={{ color: "var(--text-primary)" }}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && <span>({reviewCount})</span>}
    </div>
  );
}

/* ===================================================================
   AVATAR WITH RING — Orbital or glow ring option
   =================================================================== */

export function AvatarWithRing({
  name,
  gradient = "from-indigo-500 to-cyan-400",
  size = 48,
  online,
  orbital = false,
}: {
  name: string;
  gradient?: string;
  size?: number;
  online?: boolean;
  orbital?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative shrink-0" style={{ width: size + (orbital ? 36 : 0), height: size + (orbital ? 36 : 0) }}>
      {orbital && (
        <>
          <span className="orbital-ring ring-1" style={{ inset: 0 }} />
          <span className="orbital-ring ring-2" style={{ inset: 12 }} />
        </>
      )}
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br text-white font-bold",
          gradient
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.36,
          position: orbital ? "absolute" : "relative",
          top: orbital ? "50%" : undefined,
          left: orbital ? "50%" : undefined,
          transform: orbital ? "translate(-50%, -50%)" : undefined,
          boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full ring-2",
            online ? "glow-dot-green" : "bg-[var(--text-muted)]"
          )}
          style={{ "--tw-ring-color": "var(--surface)" } as React.CSSProperties}
        />
      )}
    </div>
  );
}

/* ===================================================================
   EMPTY STATE — Illustrated placeholder
   =================================================================== */

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center"
      style={{
        borderColor: "var(--border-bright)",
        background: "linear-gradient(135deg, rgba(10,10,24,0.8), rgba(15,15,32,0.6))",
      }}
    >
      <div className="relative">
        <span
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(99,102,241,0.1)",
            color: "var(--accent-indigo-bright)",
            boxShadow: "0 0 24px rgba(99,102,241,0.2)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <Icon size={28} strokeWidth={1.5} />
        </span>
      </div>
      <div>
        <h3 className="font-display text-base" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="mt-1 max-w-xs text-sm" style={{ color: "var(--text-muted)" }}>
          {message}
        </p>
      </div>
      {action}
    </div>
  );
}

/* ===================================================================
   LOADING SKELETON — Shimmer loading placeholders
   =================================================================== */

export function LoadingSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-4 rounded-xl"
          style={{ width: `${100 - i * 18}%`, opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ===================================================================
   MODAL — Animated overlay dialog
   =================================================================== */

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className={cn("w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl", maxWidth)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-bright)",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)",
            }}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {title && (
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="block h-4 w-0.5 rounded-full"
                    style={{ background: "linear-gradient(to bottom, #6366f1, #22d3ee)" }}
                  />
                  <h3 className="font-display text-base" style={{ color: "var(--text-primary)" }}>
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1.5 transition-all"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ===================================================================
   TOAST VIEWPORT — Stacked toast notifications
   =================================================================== */

export function ToastViewport({
  toasts,
}: {
  toasts: { id: number; message: string; variant: string }[];
}) {
  const config: Record<string, { bg: string; icon: ReactNode }> = {
    success: {
      bg: "border-l-[var(--accent-emerald)]",
      icon: <CheckCircle2 size={16} style={{ color: "var(--accent-emerald)" }} />,
    },
    error: {
      bg: "border-l-[var(--accent-red)]",
      icon: <AlertCircle size={16} style={{ color: "var(--accent-red)" }} />,
    },
    info: {
      bg: "border-l-[var(--accent-indigo)]",
      icon: <Info size={16} style={{ color: "var(--accent-indigo)" }} />,
    },
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[min(360px,90vw)]">
      <AnimatePresence>
        {toasts.map((t) => {
          const cfg = config[t.variant] || config.info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className={cn(
                "flex items-center gap-3 rounded-xl border-l-4 px-4 py-3 text-sm font-medium",
                cfg.bg
              )}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-bright)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                color: "var(--text-primary)",
              }}
            >
              {cfg.icon}
              <span>{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ===================================================================
   PULSE RADAR — Animated radar rings
   =================================================================== */

export function PulseRadar({
  color = "var(--accent-emerald)",
  size = 200,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, color }}
    >
      <span className="pulse-ring" />
      <span className="pulse-ring delay-1" />
      <span className="pulse-ring delay-2" />
    </div>
  );
}

/* ===================================================================
   ORBITAL RINGS — Decorative spinning rings
   =================================================================== */

export function OrbitalRings() {
  return (
    <>
      <span className="orbital-ring ring-1" />
      <span className="orbital-ring ring-2" style={{ inset: 20 }} />
      <span className="orbital-ring ring-3" style={{ inset: 40 }} />
    </>
  );
}

/* ===================================================================
   PROGRESS BAR — Animated colored bar
   =================================================================== */

export function ProgressBar({
  value,
  max = 100,
  color = "#6366f1",
  height = 6,
  animated = true,
  className,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  animated?: boolean;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full", className)}
      style={{ height, background: "rgba(255,255,255,0.06)" }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={animated ? { width: 0 } : { width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
        style={{
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow: `0 0 12px ${color}66`,
        }}
      />
    </div>
  );
}

/* ===================================================================
   ICON BOX — Colored icon container
   =================================================================== */

export function IconBox({
  icon: Icon,
  color = "indigo",
  size = 40,
}: {
  icon: LucideIcon;
  color?: "indigo" | "cyan" | "emerald" | "amber" | "red" | "violet";
  size?: number;
}) {
  const colors: Record<string, [string, string]> = {
    indigo: ["rgba(99,102,241,0.15)", "#818cf8"],
    cyan: ["rgba(34,211,238,0.15)", "#67e8f9"],
    emerald: ["rgba(16,185,129,0.15)", "#34d399"],
    amber: ["rgba(245,158,11,0.15)", "#fbbf24"],
    red: ["rgba(239,68,68,0.15)", "#f87171"],
    violet: ["rgba(168,85,247,0.15)", "#c084fc"],
  };
  const [bg, fg] = colors[color] || colors.indigo;

  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        boxShadow: `0 0 16px ${bg}`,
      }}
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={2} />
    </div>
  );
}

/* ===================================================================
   DIVIDER — Gradient horizontal rule
   =================================================================== */

export function GradientDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full", className)}
      style={{
        background:
          "linear-gradient(to right, transparent, rgba(99,102,241,0.4), rgba(34,211,238,0.3), transparent)",
      }}
    />
  );
}
