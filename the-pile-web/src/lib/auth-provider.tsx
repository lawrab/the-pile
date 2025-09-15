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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const queryClient = useQueryClient()

  // Check authentication status on mount
  useEffect(() => {
    // Since we're using httpOnly cookies, we can't directly check them
    // We'll rely on the API call to determine auth status
    setIsAuthenticated(true) // Let the query determine actual auth status
  }, [])

  // Listen for session expired events and clear everything
  useEffect(() => {
    const unsubscribe = authEvents.on('session-expired', () => {
      setIsAuthenticated(false)
      // Clear all query cache to prevent stale user data
      queryClient.clear()
    })

    return unsubscribe
  }, [queryClient])

  // Fetch current user - cookies will be sent automatically
  // Using staleTime and cacheTime to prevent unnecessary re-fetches
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser()
      return response.data
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      setIsAuthenticated(false)
    } else if (user) {
      setIsAuthenticated(true)
    }
  }, [error, user])

  const login = async () => {
    try {
      // Redirect directly to backend Steam login endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/steam/login`
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = () => {
    // Call backend logout endpoint to clear httpOnly cookie
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`
  }

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading && isAuthenticated,
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