import { Button as HeadlessUIButton } from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-colors disabled:opacity-70",
  {
    variants: {
      variant: {
        default:
          "bg-primary hover:enabled:bg-primary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
        secondary:
          "bg-secondary-lighter hover:bg-secondary-lighter/90 text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:bg-secondary-lighter/90",
        ghost: "bg-transparent",
      },
      size: {
        default: "px-4 h-8",
        sm: "px-4 h-9",
        lg: "px-8 h-[52px]",
        icon: "p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    return (
      <HeadlessUIButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </HeadlessUIButton>
    );
  }
);
Button.displayName = "Button";

export default Button;
