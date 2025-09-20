import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onDismiss: (id: string) => void
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: "border-green-500/50 bg-green-950/50 text-green-100",
    iconClassName: "text-green-400"
  },
  error: {
    icon: AlertCircle,
    className: "border-red-500/50 bg-red-950/50 text-red-100", 
    iconClassName: "text-red-400"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-500/50 bg-yellow-950/50 text-yellow-100",
    iconClassName: "text-yellow-400"
  },
  info: {
    icon: Info,
    className: "border-blue-500/50 bg-blue-950/50 text-blue-100",
    iconClassName: "text-blue-400"
  }
}

export function Toast({ id, title, description, type, duration = 5000, onDismiss }: ToastProps) {
  const variant = toastVariants[type]
  const Icon = variant.icon

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-between space-x-4 rounded-lg border p-4 shadow-lg",
        "animate-in slide-in-from-top-full fade-in duration-300",
        variant.className
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", variant.iconClassName)} />
        <div className="space-y-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}