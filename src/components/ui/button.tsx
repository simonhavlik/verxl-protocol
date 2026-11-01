import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[2px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#b8f6dd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-[#b8f6dd]/35 bg-[#b8f6dd] text-[#07110d] hover:bg-[#d7f8ec]",
        destructive: "border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
        outline: "border border-[#b8f6dd]/30 bg-transparent text-[#dff8ef] hover:border-[#b8f6dd]/60 hover:bg-[#b8f6dd]/5",
        secondary: "border border-white/10 bg-white/[0.04] text-[#dff8ef] hover:bg-white/[0.07]",
        ghost: "border border-transparent text-[#87959b] hover:text-[#b8f6dd]",
        link: "text-[#b8f6dd] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
