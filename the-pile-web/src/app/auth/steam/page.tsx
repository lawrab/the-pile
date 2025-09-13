'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-provider'
import { Gamepad2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SteamAuthPage() {
  const { login, isLoading } = useAuth()

  useEffect(() => {
    // Auto-initiate login
    login()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center p-8 max-w-md">
        <div className="mb-8">
          <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-2xl font-bold mb-2">Connecting to Steam</h1>
          <p className="text-slate-400">
            Redirecting you to Steam for authentication...
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Connecting...</span>
          </div>
        ) : (
          <Button onClick={login} size="lg">
            <Gamepad2 className="mr-2 h-5 w-5" />
            Login with Steam
          </Button>
        )}
        
        <p className="text-sm text-slate-500 mt-6">
          We only access your public Steam profile and game library.
          Your data stays private.
        </p>
      </div>
    </div>
  )
}