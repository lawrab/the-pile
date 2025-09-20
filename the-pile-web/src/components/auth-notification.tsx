'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authEvents } from '@/lib/auth-events'
import { Button } from '@/components/ui/button'
import { X, LogIn, AlertCircle, Loader2 } from 'lucide-react'

export function AuthNotification() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const unsubscribe = authEvents.on('session-expired', (e) => {
      // Don't show notification if auto-retry is happening
      if (e.detail?.autoRetry === false) {
        setMessage(e.detail?.message || 'Your session has expired. Please log in again.')
        setShow(true)
      }
    })

    return unsubscribe
  }, [])

  const handleLogin = async () => {
    setIsRetrying(true)
    try {
      // Store current page as return URL
      const currentUrl = window.location.pathname + window.location.search
      localStorage.setItem('auth_return_url', currentUrl)
      
      // Redirect to Steam login
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/steam/login`
    } catch (error) {
      console.error('Login failed:', error)
      setIsRetrying(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Session Expired</h3>
            <p className="text-sm text-slate-400 mb-3">
              {message} You&apos;ll be returned to this page after logging in.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleLogin}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1" />
                    Login with Steam
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShow(false)}
                disabled={isRetrying}
              >
                Dismiss
              </Button>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-slate-400 hover:text-slate-300 transition-colors"
            disabled={isRetrying}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}