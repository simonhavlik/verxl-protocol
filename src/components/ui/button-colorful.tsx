import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonColorfulAppearance = "solid" | "transparent" | "outline" | "ghost";

interface ButtonColorfulProps extends Omit<ButtonProps, "children"> {
  label: string;
  appearance?: ButtonColorfulAppearance;
  showArrow?: boolean;
  icon?: LucideIcon;
}

const APPEARANCE: Record<ButtonColorfulAppearance, string> = {
  solid: "border-[#b8f6dd]/35 bg-[#080d12]/90 text-[#dff8ef] hover:border-[#b8f6dd]/60",
  transparent: "border-white/12 bg-transparent text-[#c9d4d8] hover:border-[#b8f6dd]/40 hover:text-[#f3f6f5]",
  outline: "border-[#b8f6dd]/45 bg-transparent text-[#dff8ef] hover:border-[#b8f6dd]/80",
  ghost: "border-transparent bg-transparent text-[#87959b] hover:text-[#b8f6dd]",
};

/**
 * The supplied ButtonColorful, remapped to the Verxl palette. The gradient is
 * mint → sage → deep sage, kept behind a dark pane so labels stay legible.
 */
export function ButtonColorful({
  className,
  label,
  appearance = "solid",
  showArrow = true,
  icon: Icon,
  ...props
}: ButtonColorfulProps) {
  const isGhost = appearance === "ghost";
  return (
    <Button
      variant="ghost"
      className={cn(
        "group relative h-10 overflow-hidden rounded-[2px] px-4 text-[12px] font-medium",
        "transition-[border-color,color,transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_0_28px_-12px_rgba(184,246,221,0.55)]",
        APPEARANCE[appearance],
        isGhost && "h-auto px-1 py-2.5 text-[11px] font-mono",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r from-[#b8f6dd] via-[#7fae9d] to-[#48695d] blur-xl transition-opacity duration-500",
          isGhost
            ? "opacity-0 group-hover:opacity-35"
            : appearance === "transparent"
              ? "opacity-0 group-hover:opacity-45"
              : "opacity-45 group-hover:opacity-90",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-300",
          appearance === "solid" && "bg-[#080d12]/40 group-hover:bg-[#080d12]/15",
          appearance === "transparent" && "bg-[#05070b]/10 group-hover:bg-transparent",
          appearance === "outline" && "bg-[#05070b]/20 group-hover:bg-[#05070b]/5",
        )}
      />
      <span className="relative flex items-center justify-center gap-2">
        {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" /> : null}
        <span>{label}</span>
        {showArrow ? (
          <ArrowUpRight
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
              isGhost ? "text-[#b8f6dd]/80" : "text-[#dff8ef]/80",
            )}
            aria-hidden="true"
          />
        ) : null}
      </span>
    </Button>
  );
}
