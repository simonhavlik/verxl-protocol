import { Braces, Layers3, MessageSquare, TerminalSquare } from "lucide-react";
import { LiquidGlassButton } from "./ui/liquid-glass-button";

interface ProductGlassRailProps {
  onNavigate: (tab: string) => void;
}

const PRODUCTS = [
  {
    label: "Chat",
    description: "Ask anything. Encrypted before it leaves this device.",
    icon: MessageSquare,
    tab: "chat",
  },
  {
    label: "Playground",
    description: "Compare models, stream tokens and see the unit cost.",
    icon: TerminalSquare,
    tab: "playground",
  },
  {
    label: "Registry",
    description: "Reviewed providers, live routes and provider payouts.",
    icon: Layers3,
    tab: "registry",
  },
  {
    label: "API + keys",
    description: "One OpenAI-compatible endpoint. Keys, usage, settlement.",
    icon: Braces,
    tab: "console",
  },
] as const;

export function ProductGlassRail({ onNavigate }: ProductGlassRailProps) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-5 pt-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-t border-white/10 pt-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#87959b]">
            <span className="h-1.5 w-1.5 bg-[#b8f6dd]" />
            <span>Products</span>
            <span className="text-white/20">/ 01</span>
          </div>
          <h2 className="mt-3 text-[clamp(2rem,4.2vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#f3f6f5]">
            Four surfaces.
            <br />
            <span className="text-[#8fa39b]">One workspace.</span>
          </h2>
        </div>
        <p className="max-w-sm text-[14px] leading-relaxed text-[#a9b6bd]">
          Same account, same clearing path. Pick a surface and go straight in.
        </p>
      </div>

      <div className="lg-rail mt-6">
        {PRODUCTS.map((product, index) => (
          <LiquidGlassButton
            key={product.tab}
            index={index}
            label={product.label}
            description={product.description}
            icon={product.icon}
            onClick={() => onNavigate(product.tab)}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGlassRail;
