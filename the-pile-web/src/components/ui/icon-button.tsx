import * as React from "react"
import { Button, ButtonProps } from "./button"
import { ButtonIcon } from "./button-icon"
import { LucideIcon, Play, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconButtonProps extends ButtonProps {
  icon: LucideIcon
  iconPosition?: "left" | "right"
  iconSize?: "sm" | "md" | "lg"
  iconClassName?: string
  children?: React.ReactNode
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconPosition = "left", iconSize, iconClassName, children, className, size, ...props }, ref) => {
    // Auto-size icons based on button size
    const defaultIconSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md"
    const finalIconSize = iconSize || defaultIconSize

    // Handle loading icon special case
    const isLoading = icon === Loader2
    const finalIconClassName = cn(
      isLoading && "animate-spin",
      iconClassName
    )

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          // Keep default centering behavior for buttons
          className
        )}
        {...props}
      >
        {iconPosition === "left" && (
          <ButtonIcon icon={icon} size={finalIconSize} className={finalIconClassName} />
        )}
        {children}
        {iconPosition === "right" && (
          <ButtonIcon icon={icon} size={finalIconSize} className={finalIconClassName} />
        )}
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

// Convenience components for common patterns
export const PlayButton = React.forwardRef<HTMLButtonElement, Omit<IconButtonProps, "icon">>(
  (props, ref) => <IconButton ref={ref} icon={Play} {...props} />
)
PlayButton.displayName = "PlayButton"

export const DownloadButton = React.forwardRef<HTMLButtonElement, Omit<IconButtonProps, "icon">>(
  (props, ref) => <IconButton ref={ref} icon={Download} {...props} />
)
DownloadButton.displayName = "DownloadButton"

export const LoadingButton = React.forwardRef<HTMLButtonElement, Omit<IconButtonProps, "icon">>(
  (props, ref) => <IconButton ref={ref} icon={Loader2} className="animate-spin" {...props} />
)
LoadingButton.displayName = "LoadingButton"