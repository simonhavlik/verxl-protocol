import React, { useEffect, useRef, useState } from "react";

interface ShmackBackgroundProps {
  activeTab: string;
}

interface TabPalette {
  orb1: string; // primary glow
  orb2: string; // secondary glow
  orb3: string; // accent / contrast
  ambient: string;
}

const TAB_PALETTES: Record<string, TabPalette> = {
  playground: {
    orb1: "rgba(59, 130, 246, 0.28)",   // Electric Cobalt
    orb2: "rgba(6, 182, 212, 0.22)",    // Cyan
    orb3: "rgba(99, 102, 241, 0.20)",   // Indigo
    ambient: "rgba(59, 130, 246, 0.04)",
  },
  registry: {
    orb1: "rgba(14, 165, 233, 0.26)",   // Sky Blue
    orb2: "rgba(16, 185, 129, 0.20)",   // Emerald Compute
    orb3: "rgba(37, 99, 235, 0.22)",    // Deep Blue
    ambient: "rgba(14, 165, 233, 0.04)",
  },
  oracle: {
    orb1: "rgba(244, 63, 94, 0.22)",    // Crimson Slashing
    orb2: "rgba(168, 85, 247, 0.22)",   // Purple Nash
    orb3: "rgba(245, 158, 11, 0.18)",   // Amber Alert
    ambient: "rgba(244, 63, 94, 0.04)",
  },
  whitepaper: {
    orb1: "rgba(71, 85, 105, 0.30)",    // Slate Institutional
    orb2: "rgba(29, 78, 216, 0.22)",    // Academic Navy
    orb3: "rgba(6, 182, 212, 0.16)",    // Ice Cyan
    ambient: "rgba(59, 130, 246, 0.03)",
  },
  governance: {
    orb1: "rgba(16, 185, 129, 0.24)",   // Aragon Emerald
    orb2: "rgba(217, 119, 6, 0.20)",    // Treasury Amber
    orb3: "rgba(79, 70, 229, 0.18)",    // Sovereign Indigo
    ambient: "rgba(16, 185, 129, 0.04)",
  },
  vision: {
    orb1: "rgba(59, 130, 246, 0.28)",   // Electric Blue
    orb2: "rgba(139, 92, 246, 0.22)",   // Vision Purple
    orb3: "rgba(6, 182, 212, 0.20)",    // Horizon Cyan
    ambient: "rgba(99, 102, 241, 0.04)",
  },
  console: {
    orb1: "rgba(59, 130, 246, 0.26)",   // Electric Blue
    orb2: "rgba(16, 185, 129, 0.20)",   // Settlement Emerald
    orb3: "rgba(147, 51, 234, 0.20)",   // Arbitrum Purple
    ambient: "rgba(59, 130, 246, 0.03)",
  },
};

export const ShmackBackground: React.FC<ShmackBackgroundProps> = ({ activeTab }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [mounted, setMounted] = useState(false);

  const palette = TAB_PALETTES[activeTab] || TAB_PALETTES.playground;

  useEffect(() => {
    setMounted(true);

    // On touch devices / phones, skip the continuous mouse-lerp render loop to save CPU & battery
    const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
    if (isTouch) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      pointer.current.tx = e.clientX;
      pointer.current.ty = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let rafId: number;
    const animate = () => {
      // Smooth 8% lerp interpolation for silky cursor lag
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.08;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.08;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${pointer.current.x}px, ${pointer.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden transition-colors duration-1000 select-none"
      style={{ zIndex: 0 }}
    >
      {/* 1. Ambient Background Hue */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ backgroundColor: palette.ambient }}
      />

      {/* 2. Shmack OS Moving Atmospheric Glow Orbs with changing colors */}
      <div
        className="absolute -left-20 top-1/6 w-[480px] h-[480px] rounded-full blur-[130px] transition-all duration-1000 animate-pulse"
        style={{
          background: palette.orb1,
          animationDuration: "9s",
        }}
      />
      <div
        className="absolute -right-24 top-1/4 w-[460px] h-[460px] rounded-full blur-[140px] transition-all duration-1000"
        style={{
          background: palette.orb2,
          animation: "heroDriftA 22s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute bottom-10 left-1/3 w-[520px] h-[520px] rounded-full blur-[150px] transition-all duration-1000"
        style={{
          background: palette.orb3,
          animation: "heroDriftB 26s ease-in-out infinite alternate",
        }}
      />

      {/* 3. Interactive Mouse-Following Spotlight (Shmack OS / Personal-Website) */}
      <div
        ref={spotlightRef}
        className="absolute left-0 top-0 w-[540px] h-[540px] rounded-full pointer-events-none blur-[90px] opacity-70 transition-[background] duration-700"
        style={{
          background: `radial-gradient(circle, ${palette.orb1} 0%, ${palette.orb2} 40%, transparent 70%)`,
          willChange: "transform",
        }}
      />

      {/* 4. Fine Dot Matrix Grid Pattern (Shmack OS Texture) */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      />

      {/* 5. Hairline Geometric Instrument Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(75% 65% at 50% 50%, #000 0%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(75% 65% at 50% 50%, #000 0%, transparent 95%)",
        }}
      />

      {/* 6. Subtle Vignette Top & Bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070b]/60 via-transparent to-[#05070b]/80" />
    </div>
  );
};
