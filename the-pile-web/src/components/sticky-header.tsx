'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-provider'
import { 
  Search,
  Home,
  BarChart3,
  Archive,
  Plus,
  Gamepad2,
  Menu,
  X,
  Zap,
  Trophy,
  Clock,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface StickyHeaderProps {
  onSearchFocus: () => void
  onQuickAdd: () => void
  onScrollToSection?: (section: 'dashboard' | 'games' | 'stats') => void
  searchValue: string
  onSearchChange: (value: string) => void
}

export function StickyHeader({ 
  onSearchFocus, 
  onQuickAdd,
  onScrollToSection,
  searchValue,
  onSearchChange 
}: StickyHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault()
          onSearchFocus()
          break
        case 'h':
          if (pathname !== '/pile') {
            e.preventDefault()
            router.push('/pile')
          }
          break
        case 'n':
          e.preventDefault()
          onQuickAdd()
          break
        case '1':
          onScrollToSection?.('dashboard')
          break
        case '2':
          onScrollToSection?.('games')
          break
        case '3':
          onScrollToSection?.('stats')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pathname, onSearchFocus, onQuickAdd, onScrollToSection, router])

  if (!user) return null

  const navItems = [
    { href: '/pile', icon: Home, label: 'Dashboard', key: 'H' },
    { href: '/stats', icon: BarChart3, label: 'Stats', key: 'T' },
    { href: '/cemetery', icon: Archive, label: 'Archive', key: 'A' },
  ]

  const quickActions = [
    { 
      icon: Target, 
      label: 'Dashboard', 
      onClick: () => onScrollToSection?.('dashboard'),
      key: '1'
    },
    { 
      icon: Gamepad2, 
      label: 'Games', 
      onClick: () => onScrollToSection?.('games'),
      key: '2'
    },
    { 
      icon: BarChart3, 
      label: 'Stats', 
      onClick: () => onScrollToSection?.('stats'),
      key: '3'
    },
  ]

  return (
    <>
      {/* Sticky Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/pile" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-2xl">🎮</span>
              <span className="hidden sm:inline">The Pile</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search games... (Press S)"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={onSearchFocus}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">
                  ⌘S
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
              
              {/* Quick Add */}
              <Button
                variant="outline"
                size="sm"
                onClick={onQuickAdd}
                className="gap-2 ml-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Quick Add</span>
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden lg:inline text-sm font-medium">
                  {user.username}
                </span>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Quick Actions Bar - Only show when scrolled on desktop */}
          {isScrolled && pathname === '/pile' && (
            <div className="hidden md:flex items-center justify-center gap-2 pb-3 pt-1 border-t border-slate-700/30">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={action.onClick}
                    className="gap-2 text-xs"
                  >
                    <Icon className="h-3 w-3" />
                    {action.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => {
                    onSearchFocus()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mobile Navigation */}
              <div className="grid gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3 py-3"
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 py-3 mt-4"
                  onClick={() => {
                    onQuickAdd()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Plus className="h-5 w-5" />
                  Quick Add Game
                </Button>

                {/* Quick Actions for Mobile */}
                {pathname === '/pile' && (
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <p className="text-sm text-slate-400 mb-3">Jump to Section</p>
                    <div className="grid gap-2">
                      {quickActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => {
                              action.onClick()
                              setIsMobileMenuOpen(false)
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            {action.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* User Info */}
                <div className="border-t border-slate-700 pt-4 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={user.avatar_url} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-slate-400">Steam User</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}