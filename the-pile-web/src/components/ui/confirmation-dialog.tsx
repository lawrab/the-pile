import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

const typeStyles = {
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-400",
    borderClass: "border-yellow-500/50",
    bgClass: "bg-yellow-950/20"
  },
  danger: {
    icon: AlertTriangle,
    iconClass: "text-red-400", 
    borderClass: "border-red-500/50",
    bgClass: "bg-red-950/20"
  },
  info: {
    icon: AlertTriangle,
    iconClass: "text-blue-400",
    borderClass: "border-blue-500/50", 
    bgClass: "bg-blue-950/20"
  }
}

export function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = 'warning'
}: ConfirmationDialogProps) {
  const style = typeStyles[type]
  const Icon = style.icon

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className={cn(
        "relative bg-slate-800 border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl",
        style.borderClass,
        style.bgClass
      )}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start space-x-4 mb-6">
          <Icon className={cn("h-6 w-6 mt-1 flex-shrink-0", style.iconClass)} />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex space-x-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-slate-700"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn(
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
              type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}