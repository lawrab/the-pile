import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface ButtonIconProps {
  icon: LucideIcon
  size?: "sm" | "md" | "lg"
  className?: string
}

const iconSizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4", 
  lg: "h-5 w-5"
}

export function ButtonIcon({ icon: Icon, size = "md", className }: ButtonIconProps) {
  return (
    <Icon 
      className={cn(
        iconSizeMap[size],
        "flex-shrink-0", // Prevent icon from shrinking
        className
      )} 
    />
  )
}

// For backward compatibility and convenience
export const BIcon = ButtonIcon