import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-custom text-customDark border-customShade border-2 border-b-4 active:border-b-2 hover:bg-customMid text-customDark",
        primary: "bg-orange-400 text-primary-foreground hover:bg-orange-400/90 border-orange-500 border-b-4 active:border-b-0",
        primaryOutline: "bg-custom text-orange-500 hover:bg-customMid",
        secondary: "bg-amber-700 text-primary-foreground hover:bg-amber-700/90 border-amber-800 border-b-4 active:border-b-0",
        secondaryOutline: "bg-custom text-amber-700 hover:bg-customMid",
        danger: "bg-red-500 text-primary-foreground hover:bg-red-500/90 border-red-600 border-b-4 active:border-b-0",
        dangerOutline: "bg-custom text-red-500 hover:bg-customMid",
        super: "bg-violet-500 text-primary-foreground hover:bg-violet-500/90 border-violet-600 border-b-4 active:border-b-0",
        superOutline: "bg-custom text-violet-500 hover:bg-customMid",
        ghost: "bg-transparent text-customDark border-transparent border-0 hover:bg-customMid",
        sidebar: "bg-transparent text-customDark border-transparent border-2 hover:bg-customMid transition-none",
        sidebarOutline: "bg-customShade/15 text-customDark border-customDark border-2 transition-none",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
