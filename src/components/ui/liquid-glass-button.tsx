import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import "./liquid-glass-button.css";

export interface LiquidGlassButtonProps {
  index: number;
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

/**
 * A product-surface button with the same liquid-glass language as the 21st.dev
 * reveal: a mint-tinted pane, a pointer-following lens, a specular sweep and a
 * short glass-drop reveal when the rail enters the viewport.
 *
 * Kept as a CSS composite instead of four WebGL logo canvases. The Overview
 * already runs one Three.js context; four more would cost frames for a control
 * that must stay keyboard-accessible and instant.
 */
export function LiquidGlassButton({
  index,
  label,
  description,
  icon: Icon,
  onClick,
  className,
}: LiquidGlassButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "80px 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function handlePointerLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "0%");
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn("lg-tile", visible && "is-in", className)}
      style={{ "--i": index } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      aria-label={`Open ${label}`}
    >
      <span className="lg-drop" aria-hidden="true" />
      <span className="lg-lens" aria-hidden="true" />
      <span className="lg-sheen" aria-hidden="true" />

      <span className="lg-top">
        <span className="lg-num">{String(index + 1).padStart(2, "0")} / Surface</span>
        <span className="lg-arrow" aria-hidden="true">
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </span>

      <span className="lg-icon" aria-hidden="true">
        <Icon className="h-6 w-6" strokeWidth={1.45} />
      </span>

      <span className="lg-copy">
        <span className="lg-label">{label}</span>
        <span className="lg-desc">{description}</span>
      </span>
    </button>
  );
}
