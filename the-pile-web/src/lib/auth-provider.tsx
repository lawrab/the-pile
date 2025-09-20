'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // Use React Query to manage authentication state
  const { 
    data: user, 
    isLoading, 
    error,
    refetch: checkAuth
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser()
      return response.data
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized) - user is not logged in
      if (error?.response?.status === 401) {
        return false
      }
      // Retry up to 2 times for other errors (network issues, etc.)
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Re-check when user returns to tab
    refetchOnMount: true, // Always check on mount
  })

  const login = () => {
    // Store the current URL so we can return here after auth
    const currentUrl = window.location.pathname + window.location.search
    if (currentUrl !== '/auth/steam' && currentUrl !== '/auth/callback') {
      localStorage.setItem('auth_return_url', currentUrl)
    }
    
    // Redirect to backend Steam login endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/steam/login`
  }

  const logout = () => {
    // Clear any stored return URL
    localStorage.removeItem('auth_return_url')
    
    // Clear query cache immediately
    queryClient.clear()
    
    // Call backend logout endpoint to clear httpOnly cookie
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`
  }

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
    login,
    logout,
    checkAuth,
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