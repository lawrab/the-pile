'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { authEvents } from '@/lib/auth-events'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Check for token in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  // Listen for session expired events and clear everything
  useEffect(() => {
    const unsubscribe = authEvents.on('session-expired', () => {
      setToken(null)
      // Clear all query cache to prevent stale user data
      queryClient.clear()
    })

    return unsubscribe
  }, [queryClient])

  // Fetch current user if we have a token
  // Using staleTime and cacheTime to prevent unnecessary re-fetches
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser()
      return response.data
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  // Clear token if user fetch fails (invalid token)
  useEffect(() => {
    if (error && token) {
      localStorage.removeItem('auth_token')
      setToken(null)
    }
  }, [error, token])

  const login = async () => {
    try {
      // Redirect directly to backend Steam login endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/steam/login`
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    window.location.href = '/'
  }

  // Save token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token)
    }
  }, [token])

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading && !!token,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}