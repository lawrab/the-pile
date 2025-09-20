'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-provider'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuth } = useAuth()

  useEffect(() => {
    const success = searchParams.get('success')
    
    if (success === 'true') {
      // Authentication successful, cookie is already set by backend
      // Force a re-check of auth status and then redirect
      const handleSuccessfulAuth = async () => {
        // Re-check auth to update the provider state
        await checkAuth()
        
        // Check if we have a stored return URL
        const returnUrl = localStorage.getItem('auth_return_url')
        
        if (returnUrl) {
          localStorage.removeItem('auth_return_url')
          router.push(returnUrl)
        } else {
          // Default to pile dashboard
          router.push('/pile')
        }
      }
      
      // Small delay to ensure cookie is properly set
      setTimeout(handleSuccessfulAuth, 100)
    } else {
      // If no success param, redirect to login
      router.push('/auth/steam')
    }
  }, [router, searchParams, checkAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Authenticating...</h1>
        <p className="text-base text-slate-400">Please wait while we set up your account</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}