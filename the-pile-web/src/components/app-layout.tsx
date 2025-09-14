'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-provider'
import { StickyHeader } from '@/components/sticky-header'
import { useRouter, usePathname } from 'next/navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')

  // Don't show header on auth pages or landing page for non-authenticated users
  const isAuthPage = pathname?.startsWith('/auth')
  const isLandingPage = pathname === '/' && !user
  const showHeader = user && !isAuthPage && !isLandingPage

  const handleSearchFocus = () => {
    // If not on pile page, navigate there first
    if (pathname !== '/pile') {
      router.push('/pile')
    }
    // Focus search after navigation
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }, 100)
  }

  const handleQuickAdd = () => {
    // If not on pile page, navigate there first and add query param to trigger modal
    if (pathname !== '/pile') {
      router.push('/pile?quickAdd=true')
    } else {
      // On pile page, trigger the event directly
      const event = new CustomEvent('open-quick-add')
      window.dispatchEvent(event)
    }
  }

  const scrollToSection = (section: 'dashboard' | 'games' | 'stats') => {
    // Only works on pile page
    if (pathname === '/pile') {
      const element = document.getElementById(section)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Navigate to pile page with section hash
      router.push(`/pile#${section}`)
    }
  }

  return (
    <>
      {showHeader && (
        <StickyHeader
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchFocus={handleSearchFocus}
          onQuickAdd={handleQuickAdd}
          onScrollToSection={scrollToSection}
        />
      )}
      <div className={showHeader ? '' : ''}>
        {children}
      </div>
    </>
  )
}