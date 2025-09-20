import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
  {
    variants: {
      variant: {
        default: "bg-yellow-600 text-black font-semibold hover:bg-yellow-500 focus-visible:ring-yellow-500",
        destructive: "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500",
        outline: "border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500",
        secondary: "bg-slate-700 text-white hover:bg-slate-600 focus-visible:ring-slate-500",
        ghost: "text-slate-400 hover:bg-slate-800 hover:text-white",
        link: "text-yellow-400 underline-offset-4 hover:underline",
        steam: "bg-[#171a21] text-white hover:bg-[#1b2838] border border-[#2a475e] focus-visible:ring-[#2a475e]",
        // Simplified game status variants
        unplayed: "bg-red-700 text-red-100 hover:bg-red-600",
        playing: "bg-orange-600 text-orange-100 hover:bg-orange-500",
        completed: "bg-green-600 text-green-100 hover:bg-green-500",
        amnesty: "bg-blue-600 text-blue-100 hover:bg-blue-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
    const buttonClasses = cn(buttonVariants({ variant, size, className }))
    
    if (asChild) {
      // When asChild is true, we need to merge props with the child element
      const child = React.Children.only(props.children as React.ReactElement)
      return React.cloneElement(child, {
        className: cn(buttonClasses, child.props.className),
        ...props,
        children: child.props.children,
      })
    }
    
    return (
      <button
        type="button"
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {props.children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }