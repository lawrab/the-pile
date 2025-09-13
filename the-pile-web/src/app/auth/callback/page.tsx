'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      // Save token to localStorage
      localStorage.setItem('auth_token', token)
      // Redirect to pile dashboard
      router.push('/pile')
    } else {
      // If no token, redirect to login
      router.push('/auth/steam')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Authenticating...</h1>
        <p className="text-slate-400">Please wait while we set up your account</p>
      </div>
    </div>
  )
}