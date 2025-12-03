import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap label-large font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 touch-manipulation min-h-[48px] md:min-h-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 rounded-lg",
        destructive: "bg-error text-on-error hover:bg-error/90 focus:bg-error/90 active:bg-error/80 rounded-lg",
        outline: "border border-outline text-on-surface bg-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest rounded-lg",
        secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 focus:bg-secondary-container/80 active:bg-secondary-container/60 rounded-lg",
        ghost: "text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest rounded-lg",
        link: "text-primary underline-offset-4 hover:underline focus:underline",
      },
      size: {
        default: "h-12 px-6 py-3 md:h-10 md:py-2",
        sm: "h-11 px-4 py-2 md:h-8 md:py-1.5",
        lg: "h-14 px-8 py-4 md:h-12 md:py-3",
        icon: "h-12 w-12 p-0 md:h-10 md:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
