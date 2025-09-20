import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group transform-gpu backface-visibility-hidden will-change-transform gap-2",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-yellow-600 to-yellow-700 text-black font-semibold hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 mystical-glow",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30",
        outline:
          "border-2 border-purple-700/40 bg-transparent text-gray-300 hover:bg-purple-950/30 hover:border-purple-600/60 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-fix",
        secondary:
          "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 hover:scale-105",
        ghost: "text-gray-400 hover:bg-purple-950/30 hover:text-white transition-all duration-300",
        link: "text-yellow-400 underline-offset-4 hover:underline hover:text-yellow-300",
        // Atmospheric variants for game statuses
        unplayed: "bg-gradient-to-r from-red-800 to-red-900 text-red-200 hover:from-red-700 hover:to-red-800 hover:scale-105 hover:glow-unplayed",
        playing: "bg-gradient-to-r from-yellow-700 to-orange-700 text-yellow-100 hover:from-yellow-600 hover:to-orange-600 hover:scale-105 hover:glow-playing",
        completed: "bg-gradient-to-r from-green-700 to-green-800 text-green-100 hover:from-green-600 hover:to-green-700 hover:scale-105 hover:glow-completed",
        amnesty: "bg-gradient-to-r from-blue-800 to-slate-800 text-blue-200 hover:from-blue-700 hover:to-slate-700 hover:scale-105 hover:glow-amnesty",
        // Legacy support
        shame: "bg-gradient-to-r from-red-800 to-red-900 text-red-200 hover:from-red-700 hover:to-red-800 hover:scale-105 hover:glow-unplayed",
        success: "bg-gradient-to-r from-green-700 to-green-800 text-green-100 hover:from-green-600 hover:to-green-700 hover:scale-105 hover:glow-completed",
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
        {/* Mystical shimmer effect */}
        <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        
        {/* Button content */}
        <span className="relative z-10">
          {props.children}
        </span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }