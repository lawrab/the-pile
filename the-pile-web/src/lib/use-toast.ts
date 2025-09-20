import { useState, useCallback } from 'react'
import { ToastProps } from '@/components/ui/toast'

type ToastInput = Omit<ToastProps, 'id' | 'onDismiss'>

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((toast: ToastInput) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onDismiss: () => {}
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => {
    return addToast({ type: 'success', title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    return addToast({ type: 'error', title, description })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    return addToast({ type: 'warning', title, description })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    return addToast({ type: 'info', title, description })
  }, [addToast])

  // Add onDismiss to all toasts
  const toastsWithDismiss = toasts.map(toast => ({
    ...toast,
    onDismiss: dismissToast
  }))

  return {
    toasts: toastsWithDismiss,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info
  }
}