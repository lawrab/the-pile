'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/lib/use-toast'
import { ToastContainer } from '@/components/ui/toast'
import { PileEntry, GameStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { 
  Play, 
  Trophy, 
  Clock, 
  DollarSign,
  Filter,
  Grid3X3,
  List,
  Search,
  ThumbsUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Activity,
  ExternalLink,
  Heart,
  Trash2
} from 'lucide-react'

interface ModernGameGridProps {
  pile: PileEntry[]
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
  onGameClick: (game: PileEntry) => void
  onGrantAmnesty: (gameId: number) => void
  onStartPlaying: (gameId: number) => void
  searchTerm?: string
  onSearchTermChange?: (term: string) => void
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, direction: 'asc' | 'desc') => void
}

export function ModernGameGrid({
  pile,
  activeFilter,
  onFilterChange,
  onGameClick,
  onGrantAmnesty,
  onStartPlaying,
  searchTerm: externalSearchTerm = '',
  onSearchTermChange,
  sortBy,
  sortDirection = 'desc',
  onSortChange
}: ModernGameGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [internalSearchTerm, setInternalSearchTerm] = useState('')
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [lastTapTime, setLastTapTime] = useState<number>(0)
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{x: number, y: number} | null>(null)
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    action: 'amnesty' | 'play' | 'complete' | 'abandon' | null
    game: PileEntry | null
  }>({ isOpen: false, action: null, game: null })
  
  // Toast system
  const { toasts, dismissToast, success, warning, error } = useToast()
  
  // Use external search term if provided, otherwise internal
  const searchTerm = onSearchTermChange ? externalSearchTerm : internalSearchTerm
  const setSearchTerm = onSearchTermChange || setInternalSearchTerm

  // Apply client-side search filtering (server-side filtering for status already applied)
  const filteredGames = pile.filter(game => {
    const matchesSearch = !searchTerm || 
      game.steam_game.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Status counts for filter buttons
  const statusCounts = {
    [GameStatus.UNPLAYED]: pile.filter(g => g.status === GameStatus.UNPLAYED).length,
    [GameStatus.PLAYING]: pile.filter(g => g.status === GameStatus.PLAYING).length,
    [GameStatus.COMPLETED]: pile.filter(g => g.status === GameStatus.COMPLETED).length,
    [GameStatus.ABANDONED]: pile.filter(g => g.status === GameStatus.ABANDONED).length,
    [GameStatus.AMNESTY_GRANTED]: pile.filter(g => g.status === GameStatus.AMNESTY_GRANTED).length,
  }

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case GameStatus.UNPLAYED: return 'bg-red-500/30 text-red-200 border-red-400/50 shadow-red-500/20 shadow-lg'
      case GameStatus.PLAYING: return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40'
      case GameStatus.COMPLETED: return 'bg-green-500/20 text-green-200 border-green-400/40'
      case GameStatus.ABANDONED: return 'bg-orange-600/30 text-orange-200 border-orange-500/50 shadow-orange-600/20 shadow-md'
      case GameStatus.AMNESTY_GRANTED: return 'bg-purple-500/20 text-purple-200 border-purple-400/40'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const getStatusLabel = (status: GameStatus, game?: PileEntry) => {
    if (status === GameStatus.UNPLAYED && game) {
      const playtime = game.playtime_minutes || 0
      const price = game.purchase_price || 0
      
      if (playtime === 0) {
        if (price > 50) return 'UNTOUCHED (Expensive regret)'
        if (price > 20) return 'UNTOUCHED (Impulse buy?)'
        if (price > 0) return 'UNTOUCHED (Still wrapped)'
        return 'UNTOUCHED (Free & ignored)'
      }
      
      if (playtime < 60) {
        return `UNTOUCHED (${playtime}m then quit?)` 
      }
      
      return 'UNTOUCHED'
    }
    
    if (status === GameStatus.ABANDONED && game) {
      const playtime = game.playtime_minutes || 0
      const hours = Math.floor(playtime / 60)
      const price = game.purchase_price || 0
      
      if (hours < 1) {
        return 'RAGE QUIT (Under 1h)'
      }
      if (hours < 5) {
        return 'GAVE UP (Weak commitment)'
      }
      if (hours > 20) {
        if (price > 30) return 'ABANDONED (Expensive failure)'
        return 'ABANDONED (So close, yet so far)'
      }
      return 'ABANDONED (Quitter!)'
    }
    
    switch (status) {
      case GameStatus.UNPLAYED: return 'UNTOUCHED'
      case GameStatus.PLAYING: return 'Actually Playing'
      case GameStatus.COMPLETED: return 'Conquered'
      case GameStatus.ABANDONED: return 'ABANDONED'
      case GameStatus.AMNESTY_GRANTED: return 'Forgiven'
      default: return 'Unknown'
    }
  }

  // Extract just the roast message for the popover
  const getStatusRoast = (status: GameStatus, game?: PileEntry) => {
    if (status === GameStatus.UNPLAYED && game) {
      const playtime = game.playtime_minutes || 0
      const price = game.purchase_price || 0
      
      if (playtime === 0) {
        if (price > 50) return 'Expensive regret'
        if (price > 20) return 'Impulse buy?'
        if (price > 0) return 'Still wrapped'
        return 'Free & ignored'
      }
      
      if (playtime < 60) {
        return `${playtime}m then quit?` 
      }
      
      return 'Never touched'
    }
    
    if (status === GameStatus.ABANDONED && game) {
      const playtime = game.playtime_minutes || 0
      const hours = Math.floor(playtime / 60)
      const price = game.purchase_price || 0
      
      if (hours < 1) {
        return 'Under 1h'
      }
      if (hours < 5) {
        return 'Weak commitment'
      }
      if (hours > 20) {
        if (price > 30) return 'Expensive failure'
        return 'So close, yet so far'
      }
      return 'Quitter!'
    }
    
    switch (status) {
      case GameStatus.PLAYING: return 'Finally making progress'
      case GameStatus.COMPLETED: return 'Actually finished something!'
      case GameStatus.AMNESTY_GRANTED: return 'Set free from shame'
      default: return ''
    }
  }

  const formatReleaseDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.getFullYear()
    } catch {
      return null
    }
  }

  const formatLastPlayed = (timestamp?: number) => {
    if (!timestamp || timestamp === 0) return 'Never'
    
    try {
      const lastPlayed = new Date(timestamp * 1000)
      const now = new Date()
      
      // Check if the date is valid
      if (isNaN(lastPlayed.getTime())) return 'Unknown'
      
      const diffTime = now.getTime() - lastPlayed.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Future?' // Invalid timestamp
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday' 
      if (diffDays < 7) return `${diffDays}d ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
      return `${Math.floor(diffDays / 365)}y ago`
    } catch {
      return 'Unknown'
    }
  }

  const getShameIntensity = (game: PileEntry) => {
    const playtime = game.playtime_minutes || 0
    const price = game.purchase_price || 0
    
    if (game.status === GameStatus.UNPLAYED) {
      // Zero playtime is maximum shame
      if (playtime === 0) {
        if (price > 30) return 'extreme' // Expensive + untouched = maximum shame
        if (price > 0) return 'high' // Any paid game untouched
        return 'medium' // Free game untouched
      }
      
      // Very low playtime (< 1 hour) with purchase
      if (playtime < 60 && price > 0) return 'medium'
      
      return 'low'
    }
    
    if (game.status === GameStatus.ABANDONED) {
      const hours = Math.floor(playtime / 60)
      
      // Rage quits deserve maximum shame
      if (hours < 1) return 'extreme'
      
      // Expensive abandons are high shame
      if (price > 30 && hours < 10) return 'high'
      
      // Long playtime abandons are medium shame (at least you tried)
      if (hours > 20) return 'medium'
      
      return 'high'
    }
    
    return 'none'
  }

  const getShameMessage = (game: PileEntry) => {
    if (game.status !== GameStatus.UNPLAYED) return null
    
    const playtime = game.playtime_minutes || 0
    const price = game.purchase_price || 0
    const shameLevel = getShameIntensity(game)
    
    if (playtime === 0) {
      if (price > 50) return 'Expensive regret'
      if (price > 20) return 'Impulse purchase?'
      if (price > 0) return 'Still wrapped'
      return "Free & ignored"
    }
    
    if (playtime < 60) {
      return `${playtime}m (then quit?)`
    }
    
    return null
  }

  const getSarcasticPrice = (price: number | null) => {
    if (!price || price === 0) return "FREE (and you still won't play it)"
    if (price > 50) return `${formatCurrency(price)} (Hope it was worth the groceries)`
    if (price > 20) return `${formatCurrency(price)} (Couldn't resist, could you?)`
    return formatCurrency(price)
  }

  const getSarcasticPlaytime = (minutes: number, status: GameStatus, compact: boolean = false) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (status === GameStatus.UNPLAYED && minutes === 0) {
      return compact ? '0m 😬' : '0 minutes (Ouch)'
    }
    
    if (status === GameStatus.UNPLAYED && minutes < 60) {
      return compact ? `${minutes}m 🤔` : `${minutes}m (then quit?)` 
    }
    
    if (hours > 100) {
      return compact ? `${hours}h+ 📚` : `${hours}h ${mins}m (You could've learned a language)`
    }
    
    if (hours > 50) {
      return compact ? `${hours}h+ 👏` : `${hours}h ${mins}m (Impressive commitment)`
    }
    
    return `${hours}h ${mins}m`
  }

  const getSarcasticReview = (percentage: number, summary?: string) => {
    if (percentage >= 90) {
      return `${percentage}% (Everyone but you loves this)`
    }
    if (percentage >= 80) {
      return `${percentage}% (This is amazing and you're ignoring it)`
    }
    if (percentage >= 70) {
      return `${percentage}% (Pretty good, but who's counting?)`
    }
    if (percentage >= 60) {
      return `${percentage}% (Meh, like your commitment)`
    }
    return `${percentage}% (Even this trash got more attention)`
  }

  const getReviewColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getDaysOwned = (game: PileEntry) => {
    // Only use actual purchase_date, not created_at which is import date
    if (!game.purchase_date) return null
    
    try {
      const purchaseDate = new Date(game.purchase_date)
      const now = new Date()
      const diffTime = now.getTime() - purchaseDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return null
      if (diffDays === 0) return 'Bought today'
      if (diffDays === 1) return 'Bought yesterday'
      if (diffDays < 30) return `Bought ${diffDays} days ago`
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `Bought ${months} month${months > 1 ? 's' : ''} ago`
      }
      const years = Math.floor(diffDays / 365)
      return `Bought ${years} year${years > 1 ? 's' : ''} ago`
    } catch {
      return null
    }
  }

  const getSarcasticOwnership = (game: PileEntry) => {
    // Use game name in messages to make them unique and specific
    const gameName = game.steam_game.name || 'this game'
    const daysOwned = getDaysOwned(game)
    const playtime = game.playtime_minutes || 0
    const price = game.purchase_price || 0
    
    // If we have purchase date, use it for detailed shame
    if (daysOwned) {
      const days = daysOwned.includes('year') ? 365 * parseInt(daysOwned.match(/\d+/)?.[0] || '0') :
                  daysOwned.includes('month') ? 30 * parseInt(daysOwned.match(/\d+/)?.[0] || '0') :
                  parseInt(daysOwned.match(/\d+/)?.[0] || '0')
      
      if (game.status === GameStatus.UNPLAYED) {
        if (days > 730) return `${daysOwned} of owning ${gameName} without playing it (That's ${Math.floor(days/365)} years of denial)`
        if (days > 365) return `${daysOwned} and ${gameName} is still untouched (Over a year of procrastination)`
        if (days > 180) return `${gameName} has been collecting digital dust for ${daysOwned}`
        if (days > 30) return `${gameName} is ${daysOwned} old and still in digital shrink wrap`
        return `You just bought ${gameName} ${daysOwned}`
      }
      
      if (game.status === GameStatus.ABANDONED) {
        if (days > 365) return `${gameName}: ${daysOwned} (Bought it, tried it, quit it)`
        return `${gameName}: ${daysOwned} (Brief but disappointing relationship)`
      }
      
      return `${gameName} owned for ${daysOwned}`
    }
    
    // Enhanced fallback using more game-specific data
    if (game.status === GameStatus.UNPLAYED) {
      if (price > 50) return `${gameName}: ${formatCurrency(price)} expensive mistake gathering dust`
      if (price > 30) return `${gameName}: ${formatCurrency(price)} of regret sitting unplayed`
      if (price > 10) return `${gameName}: ${formatCurrency(price)} impulse purchase you'll never touch`
      if (price > 0) return `You paid money for ${gameName} just to ignore it`
      return `${gameName} is free and you still won't play it`
    }
    
    if (game.status === GameStatus.ABANDONED) {
      const hours = Math.floor(playtime / 60)
      if (hours < 1) return `${gameName}: Bought it, opened it, immediately noped out`
      if (hours < 5) return `${gameName}: ${hours}h before giving up (classic you)`
      if (hours < 20) return `${gameName}: ${hours}h investment wasted (commitment issues much?)`
      return `${gameName}: ${hours}h down the drain (started strong, finished weak)`
    }
    
    if (game.status === GameStatus.PLAYING) {
      const hours = Math.floor(playtime / 60)
      return hours > 0 ? 
        `${gameName}: ${hours}h in and actually still going (miracle!)` :
        `${gameName}: Currently in your backlog... wait, you're playing this?`
    }
    
    if (game.status === GameStatus.COMPLETED) {
      const hours = Math.floor(playtime / 60)
      return hours > 0 ?
        `${gameName}: ${hours}h well spent (congratulations, you actually finished something!)` :
        `${gameName}: Somehow completed with no recorded playtime (suspicious...)`
    }
    
    return `${gameName}: Part of your ever-growing digital hoard`
  }

  const getGenreShame = (genres?: string[], gameName?: string) => {
    if (!genres || genres.length === 0) return `No genres listed (even Steam gave up categorizing this)`
    
    const shortName = gameName ? gameName.split(' ')[0] : 'this game'
    
    const shameMap: Record<string, string[]> = {
      'RPG': [
        `RPG (Because 100-hour ${shortName} commitments are totally your thing)`,
        `RPG (${shortName} will sit there for years waiting for "the right time")`,
        `RPG (You'll start ${shortName} someday when you have 200+ hours free)`
      ],
      'Action': [
        `Action (${shortName} wants quick reflexes, you want Netflix)`,
        `Action (Too much action for your sedentary lifestyle)`,
        `Action (${shortName} requires movement, explains the avoidance)`
      ],
      'Adventure': [
        `Adventure (${shortName} offers epic journeys you'll never take)`,
        `Adventure (The only adventure is adding it to your pile)`,
        `Adventure (${shortName}: Stories you'll never experience)`
      ],
      'Indie': [
        `Indie (Supporting ${shortName}'s developers while ignoring their work)`,
        `Indie (You love the concept of ${shortName}, hate actually playing it)`,
        `Indie (${shortName} deserves better than your neglect)`
      ],
      'Strategy': [
        `Strategy (${shortName} requires thinking, explains everything)`,
        `Strategy (Too much strategy, not enough clicking "Add to Cart")`,
        `Strategy (Your only strategy with ${shortName} is avoiding it)`
      ],
      'Simulation': [
        `Simulation (${shortName}: Virtual life because real life is too real)`,
        `Simulation (Simulating owning games without playing them)`,
        `Simulation (${shortName} simulates productivity while you avoid both)`
      ],
      'Puzzle': [
        `Puzzle (Ironic, since your backlog is the biggest puzzle)`,
        `Puzzle (${shortName} wants to challenge your mind, but here we are)`,
        `Puzzle (The real puzzle is why you bought ${shortName})`
      ],
      'Platformer': [
        `Platformer (Can't even jump into playing ${shortName})`,
        `Platformer (${shortName} involves jumping, you specialize in skipping)`,
        `Platformer (The only platform ${shortName} sees is your desktop)`
      ],
      'Racing': [
        `Racing (The only race you're winning is collecting more games)`,
        `Racing (${shortName} wants speed, you prefer procrastination)`,
        `Racing (Racing to buy ${shortName}, walking away from playing it)`
      ],
      'Sports': [
        `Sports (Virtual ${shortName} athletics while avoiding real exercise)`,
        `Sports (${shortName}: The closest you get to physical activity)`,
        `Sports (Sporty ${shortName} for your decidedly unsporty lifestyle)`
      ]
    }
    
    // Find matching genre and return random shame message
    for (const genre of genres) {
      if (shameMap[genre]) {
        const messages = shameMap[genre]
        return messages[Math.floor(Math.random() * messages.length)]
      }
    }
    
    // Fallback for unrecognized genres
    const genreList = genres.slice(0, 2).join(', ')
    return `${genreList} (Your questionable taste in ${shortName} is showing)`
  }

  const getSyncReminder = (lastUpdated?: string) => {
    if (!lastUpdated) return null
    
    try {
      const lastSync = new Date(lastUpdated)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60))
      
      // Only show reminder if data is more than 24 hours old
      if (diffHours < 24) return null
      
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays === 1) return 'Sync 1 day old'
      if (diffDays < 7) return `Sync ${diffDays}d old`
      if (diffDays < 30) return `Sync ${Math.floor(diffDays / 7)}w old`
      return 'Sync very old'
    } catch {
      return null
    }
  }

  // Sarcastic confirmation message generators
  const getSarcasticConfirmation = (action: 'amnesty' | 'play' | 'complete' | 'abandon', game: PileEntry) => {
    const gameName = game.steam_game.name
    const price = game.purchase_price || 0
    const playtime = game.playtime_minutes || 0
    const hours = Math.floor(playtime / 60)
    
    switch (action) {
      case 'amnesty':
        if (price > 50) {
          return {
            title: "Finally giving up on this dream?",
            message: `You're about to grant amnesty to ${gameName}. That's ${formatCurrency(price)} you'll never see again, but at least your conscience will be clear. Are you ready to admit defeat?`,
            confirmText: "Yes, I'm a quitter",
            cancelText: "Maybe I'll play it someday"
          }
        }
        if (price > 20) {
          return {
            title: "Time to face reality?",
            message: `${gameName} has been judging you from your library. For ${formatCurrency(price)}, you could have had several nice coffees instead. Sure you want to set it free?`,
            confirmText: "Free this poor game",
            cancelText: "I might play it... eventually"
          }
        }
        return {
          title: "Giving up the ghost?",
          message: `${gameName} has been patiently waiting in your library. It's time to admit you'll never touch it. Ready to grant mercy?`,
          confirmText: "Put it out of its misery",
          cancelText: "Keep the false hope alive"
        }
        
      case 'play':
        if (game.status === GameStatus.UNPLAYED && playtime === 0) {
          return {
            title: "Actually going to commit this time?",
            message: `Mark ${gameName} as "Currently Playing"? This means people might actually expect you to play it. Are you prepared for that kind of pressure?`,
            confirmText: "I'll try to commit",
            cancelText: "Too much pressure"
          }
        }
        return {
          title: "Back for round two?",
          message: `You've already spent ${hours}h on ${gameName}. Marking it as "Playing" again? Optimistic of you.`,
          confirmText: "Third time's the charm",
          cancelText: "Who am I kidding?"
        }
        
      case 'complete':
        if (hours < 5) {
          return {
            title: "Did you really, though?",
            message: `Only ${hours}h on ${gameName} and you're calling it complete? Some people speedrun, others just... speed-quit. You sure about this?`,
            confirmText: "I saw the credits",
            cancelText: "Maybe I rushed it"
          }
        }
        return {
          title: "Congratulations, you actually finished something!",
          message: `After ${hours}h, you conquered ${gameName}! This is a rare moment of completion in your gaming career. Savor it.`,
          confirmText: "I'm proud of myself",
          cancelText: "Wait, let me double-check"
        }
        
      case 'abandon':
        if (hours < 2) {
          return {
            title: "That was quick!",
            message: `${hours}h on ${gameName} and you're already throwing in the towel? That's faster than your usual abandonment rate. Efficiency!`,
            confirmText: "Cut my losses",
            cancelText: "Give it one more hour"
          }
        }
        return {
          title: "Classic commitment issues",
          message: `${hours}h invested in ${gameName} and now you want to abandon it? Just like that relationship in college, huh?`,
          confirmText: "It's not me, it's the game",
          cancelText: "Maybe we can work it out"
        }
        
      default:
        return {
          title: "Are you sure?",
          message: "This action cannot be undone.",
          confirmText: "Confirm",
          cancelText: "Cancel"
        }
    }
  }

  // Confirmation dialog handlers
  const showConfirmation = (action: 'amnesty' | 'play' | 'complete' | 'abandon', game: PileEntry) => {
    setConfirmationDialog({ isOpen: true, action, game })
  }

  const handleConfirmAction = () => {
    if (!confirmationDialog.game || !confirmationDialog.action) return
    
    const game = confirmationDialog.game
    const action = confirmationDialog.action
    
    switch (action) {
      case 'amnesty':
        onGrantAmnesty(game.id)
        success("Amnesty Granted", `${game.steam_game.name} has been set free from your pile of shame`)
        break
      case 'play':
        onStartPlaying(game.id)
        warning("Status Updated", `${game.steam_game.name} is now marked as playing. The pressure is on!`)
        break
      // Add more cases as needed for complete/abandon if those handlers exist
    }
    
    setConfirmationDialog({ isOpen: false, action: null, game: null })
  }

  // Smart interaction handler for mobile and desktop
  const handleCardInteraction = (game: PileEntry, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    // On desktop, always open modal on click (since we have hover for quick shame)
    // On mobile, toggle expansion on first tap, modal on second tap
    if (window.innerWidth >= 640) { // sm breakpoint
      // Desktop: click always opens modal
      onGameClick(game)
    } else {
      // Mobile: tap to expand, second tap to open modal
      const now = Date.now()
      const timeSinceLastTap = now - lastTapTime
      
      if (timeSinceLastTap < 300 && expandedCard === game.id) {
        // Double tap or expanded - open modal
        onGameClick(game)
        setExpandedCard(null)
      } else {
        // Single tap - toggle expansion
        setExpandedCard(expandedCard === game.id ? null : game.id)
      }
      
      setLastTapTime(now)
    }
  }

  // Handle hover for desktop with position tracking
  const handleMouseEnter = (game: PileEntry, event: React.MouseEvent) => {
    setHoveredCard(game.id)
    
    // Calculate popover position
    const rect = event.currentTarget.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Position to the right if there's space, otherwise to the left
    let x = rect.right + 10
    if (x + 320 > viewportWidth) { // 320px is popover width
      x = rect.left - 330
    }
    
    // Position vertically centered, but adjust if it would go off-screen
    let y = rect.top + (rect.height / 2) - 150 // 150px is half popover height
    if (y < 10) y = 10
    if (y + 300 > viewportHeight) y = viewportHeight - 310
    
    setPopoverPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setHoveredCard(null)
    setPopoverPosition(null)
  }

  // Get the currently hovered game for popover
  const hoveredGame = hoveredCard ? pile.find(g => g.id === hoveredCard) : null

  return (
    <div className="space-y-8 relative">
      {/* Controls Row */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Top Row: Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your pile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    setViewMode('grid')
                  }}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    setViewMode('list')
                  }}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sorting Controls Row */}
            {onSortChange && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-400 font-medium">Sort by:</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (sortBy === 'playtime') {
                        onSortChange('playtime', sortDirection === 'desc' ? 'asc' : 'desc')
                      } else {
                        onSortChange('playtime', 'desc')
                      }
                    }}
                    className={`
                      inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                      ${sortBy === 'playtime' 
                        ? 'bg-blue-600 text-white border border-blue-600 shadow-sm' 
                        : 'bg-transparent text-slate-300 border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Playtime</span>
                    {sortBy === 'playtime' && (
                      <div className="flex-shrink-0">
                        {sortDirection === 'desc' ? 
                          <ArrowDown className="h-3 w-3" /> : 
                          <ArrowUp className="h-3 w-3" />
                        }
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (sortBy === 'rating') {
                        onSortChange('rating', sortDirection === 'desc' ? 'asc' : 'desc')
                      } else {
                        onSortChange('rating', 'desc')
                      }
                    }}
                    className={`
                      inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                      ${sortBy === 'rating' 
                        ? 'bg-blue-600 text-white border border-blue-600 shadow-sm' 
                        : 'bg-transparent text-slate-300 border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <ThumbsUp className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Rating</span>
                    {sortBy === 'rating' && (
                      <div className="flex-shrink-0">
                        {sortDirection === 'desc' ? 
                          <ArrowDown className="h-3 w-3" /> : 
                          <ArrowUp className="h-3 w-3" />
                        }
                      </div>
                    )}
                  </button>
                  {sortBy && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onSortChange('', 'desc')
                      }}
                      className="inline-flex items-center gap-1 px-2 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 transition-all"
                    >
                      <span className="whitespace-nowrap">Clear</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={!activeFilter ? 'default' : 'ghost'}
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onFilterChange(null)
              }}
              className="text-sm"
            >
              All Games ({pile.length})
            </Button>
            
            {Object.entries(statusCounts).map(([status, count]) => {
              // Always show abandoned filter, hide others if count is 0
              const shouldShow = status === GameStatus.ABANDONED || count > 0;
              return shouldShow && (
                <Button
                  key={status}
                  variant={activeFilter === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    onFilterChange(activeFilter === status ? null : status)
                  }}
                  className="text-sm"
                >
                  {getStatusLabel(status as GameStatus)} ({count})
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          {activeFilter && ` • ${getStatusLabel(activeFilter as GameStatus)}`}
          {searchTerm && ` • "${searchTerm}"`}
        </h2>
        <div className="text-xs text-slate-500 hidden sm:block">
          Hover for instant shame • Click for details
        </div>
      </div>

      {/* Game Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredGames.map((game) => (
            <Card 
              key={game.id} 
              className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group ${
                expandedCard === game.id || hoveredCard === game.id ? 'ring-2 ring-blue-500/50 border-blue-500/50' : ''
              }`}
              onClick={(e) => handleCardInteraction(game, e)}
              onMouseEnter={(e) => handleMouseEnter(game, e)}
              onMouseLeave={handleMouseLeave}
            >
              <CardContent className="p-4">
                <div className="aspect-[460/215] relative mb-3 rounded-lg overflow-hidden bg-slate-700">
                  {game.steam_game.image_url ? (
                    <Image 
                      src={game.steam_game.image_url}
                      alt={game.steam_game.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Play className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <h3 className={`mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors ${
                  game.status === GameStatus.UNPLAYED 
                    ? 'font-bold text-base text-red-200' 
                    : 'font-semibold text-sm'
                }`}>
                  {game.steam_game.name}
                </h3>

                <div className="space-y-3 text-xs text-slate-400">
                  {/* Status Badge - Full Width */}
                  <div className="space-y-1">
                    <div className={`inline-block px-2 py-1 rounded border text-[10px] font-medium leading-tight ${
                      getStatusColor(game.status)
                    } ${
                      game.status === GameStatus.UNPLAYED && getShameIntensity(game) === 'extreme' 
                        ? 'animate-pulse' 
                        : ''
                    }`}>
                      {getStatusLabel(game.status, game)}
                    </div>
                    {/* Show last played for In Progress, Completed, and Abandoned games */}
                    {(game.status === GameStatus.PLAYING || game.status === GameStatus.COMPLETED || game.status === GameStatus.ABANDONED) && (
                      <div className="text-[10px] text-slate-500">
                        Last played: {formatLastPlayed(game.steam_game.rtime_last_played)}
                      </div>
                    )}
                  </div>
                  
                  {/* Fixed Grid Layout - Always 2x2 */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                    {/* Row 1: Playtime | Price */}
                    <div className="flex items-center gap-1 min-h-[16px]">
                      <Clock className={`h-3 w-3 flex-shrink-0 ${
                        game.status === GameStatus.UNPLAYED && (game.playtime_minutes || 0) === 0 
                          ? 'text-red-400' 
                          : ''
                      }`} />
                      <span className={`text-xs leading-tight ${
                        game.status === GameStatus.UNPLAYED 
                          ? 'font-medium text-blue-300' 
                          : ''
                      }`}>
                        {getSarcasticPlaytime(game.playtime_minutes || 0, game.status, true)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 min-h-[16px]">
                      <DollarSign className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {getSarcasticPrice(game.purchase_price ?? null)}
                      </span>
                    </div>
                    
                    {/* Row 2: Release Date | Sync Reminder or Last Played */}
                    <div className="flex items-center gap-1 min-h-[16px]">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {formatReleaseDate(game.steam_game.release_date) || '—'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 min-h-[16px]">
                      {(game.status === GameStatus.PLAYING || game.status === GameStatus.COMPLETED || game.status === GameStatus.ABANDONED) ? (
                        <>
                          <Activity className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate text-[10px] leading-tight">
                            Last: {formatLastPlayed(game.steam_game.rtime_last_played)}
                          </span>
                        </>
                      ) : getSyncReminder(game.updated_at) ? (
                        <>
                          <Activity className="h-3 w-3 flex-shrink-0 text-yellow-400" />
                          <span className="truncate text-[10px] leading-tight text-yellow-400 font-medium">
                            {getSyncReminder(game.updated_at)}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] leading-tight text-slate-500">—</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Reviews - Full Width */}
                  {game.steam_game.steam_rating_percent && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
                      <div className="flex items-center gap-1">
                        {/* Steam logo placeholder - using external link icon */}
                        <ExternalLink className="h-3 w-3 flex-shrink-0 text-blue-400" />
                        <ThumbsUp className={`h-3 w-3 flex-shrink-0 ${getReviewColor(game.steam_game.steam_rating_percent)}`} />
                      </div>
                      <span className={`font-medium text-[10px] leading-tight ${getReviewColor(game.steam_game.steam_rating_percent)}`} title="Yes, real people actually played this">
                        {getSarcasticReview(game.steam_game.steam_rating_percent, game.steam_game.steam_review_summary)}
                      </span>
                    </div>
                  )}
                  
                  {/* Mobile tap expansion */}
                  {expandedCard === game.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 sm:hidden">
                      <div className="text-xs space-y-2">
                        {/* Brutal Ownership Truth */}
                        {getSarcasticOwnership(game) && (
                          <div className="bg-slate-900/50 p-2 rounded border border-red-500/20">
                            <span className="text-red-300 font-medium">Ownership Shame: </span>
                            <span className="text-slate-300">{getSarcasticOwnership(game)}</span>
                          </div>
                        )}
                        
                        {/* Genre Mockery */}
                        <div className="bg-slate-900/50 p-2 rounded border border-yellow-500/20">
                          <span className="text-yellow-300 font-medium">Genre Analysis: </span>
                          <span className="text-slate-300">{getGenreShame(game.steam_game.genres, game.steam_game.name)}</span>
                        </div>
                        
                        {/* Developer Support Guilt */}
                        <div className="bg-slate-900/50 p-2 rounded border border-purple-500/20">
                          <span className="text-purple-300 font-medium">Developer: </span>
                          <span className="text-slate-300">{game.steam_game.developer || 'Unknown (even more shameful)'}</span>
                          <div className="text-slate-400 text-[10px] mt-1">
                            {game.status === GameStatus.UNPLAYED ? 
                              'They worked hard, you bought it, now play it!' :
                              game.status === GameStatus.ABANDONED ?
                              'They put effort in, you gave up. Classic.' :
                              game.status === GameStatus.COMPLETED ?
                              'Finally, someone who appreciates good work!' :
                              'At least you\'re making progress.'
                            }
                          </div>
                        </div>
                        
                        {/* Mobile Actions */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-[10px] text-slate-500">
                            Steam ID: {game.steam_game.steam_app_id}
                          </div>
                          <div className="flex gap-1">
                            <button
                              className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 bg-blue-500/10 rounded"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://store.steampowered.com/app/${game.steam_game.steam_app_id}`, '_blank')
                              }}
                            >
                              Steam Store
                            </button>
                            <button
                              className="text-[10px] text-green-400 hover:text-green-300 transition-colors px-2 py-1 bg-green-500/10 rounded"
                              onClick={(e) => {
                                e.stopPropagation()
                                onGameClick(game)
                              }}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGames.map((game) => (
            <Card 
              key={game.id}
              className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer ${
                expandedCard === game.id || hoveredCard === game.id ? 'ring-2 ring-blue-500/50 border-blue-500/50' : ''
              }`}
              onClick={(e) => handleCardInteraction(game, e)}
              onMouseEnter={(e) => handleMouseEnter(game, e)}
              onMouseLeave={handleMouseLeave}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 rounded overflow-hidden bg-slate-700 flex-shrink-0">
                    {game.steam_game.image_url ? (
                      <Image 
                        src={game.steam_game.image_url}
                        alt={game.steam_game.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Play className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`mb-1 truncate hover:text-blue-400 transition-colors ${
                      game.status === GameStatus.UNPLAYED 
                        ? 'font-bold text-lg text-red-200' 
                        : 'font-semibold text-base'
                    }`}>
                      {game.steam_game.name}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex flex-col gap-1">
                          <div className={`px-2 py-1 rounded border text-xs font-medium leading-tight ${
                            getStatusColor(game.status)
                          } ${
                            game.status === GameStatus.UNPLAYED && getShameIntensity(game) === 'extreme' 
                              ? 'animate-pulse' 
                              : ''
                          }`}>
                            {getStatusLabel(game.status, game)}
                          </div>
                          {/* Show last played for In Progress, Completed, and Abandoned games */}
                          {(game.status === GameStatus.PLAYING || game.status === GameStatus.COMPLETED || game.status === GameStatus.ABANDONED) && (
                            <div className="text-[10px] text-slate-500 px-2">
                              Last played: {formatLastPlayed(game.steam_game.rtime_last_played)}
                            </div>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className={`h-3 w-3 ${
                            game.status === GameStatus.UNPLAYED && (game.playtime_minutes || 0) === 0 
                              ? 'text-red-400' 
                              : ''
                          }`} />
                          <span className={game.status === GameStatus.UNPLAYED ? 'font-medium text-blue-300' : ''}>
                            {getSarcasticPlaytime(game.playtime_minutes || 0, game.status, false)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {getSarcasticPrice(game.purchase_price ?? null)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatReleaseDate(game.steam_game.release_date) || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {getSyncReminder(game.updated_at) ? (
                            <span className="text-yellow-400 font-medium">{getSyncReminder(game.updated_at)}</span>
                          ) : '—'}
                        </span>
                      </div>
                      {game.steam_game.steam_rating_percent && (
                        <div className="flex items-center gap-2 text-xs pl-2">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3 text-blue-400" />
                            <ThumbsUp className={`h-3 w-3 ${getReviewColor(game.steam_game.steam_rating_percent)}`} />
                          </div>
                          <span className={`font-medium ${getReviewColor(game.steam_game.steam_rating_percent)}`} title="Yes, real people actually played this">
                            {getSarcasticReview(game.steam_game.steam_rating_percent, game.steam_game.steam_review_summary)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile tap expansion for list view */}
                    {expandedCard === game.id && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3 sm:hidden">
                        <div className="text-xs space-y-2">
                          {/* Brutal Ownership Truth */}
                          {getSarcasticOwnership(game) && (
                            <div className="bg-slate-900/50 p-2 rounded border border-red-500/20">
                              <span className="text-red-300 font-medium">Ownership Shame: </span>
                              <span className="text-slate-300">{getSarcasticOwnership(game)}</span>
                            </div>
                          )}
                          
                          {/* Genre Mockery */}
                          <div className="bg-slate-900/50 p-2 rounded border border-yellow-500/20">
                            <span className="text-yellow-300 font-medium">Genre Analysis: </span>
                            <span className="text-slate-300">{getGenreShame(game.steam_game.genres, game.steam_game.name)}</span>
                          </div>
                          
                          {/* Developer Support Guilt */}
                          <div className="bg-slate-900/50 p-2 rounded border border-purple-500/20">
                            <span className="text-purple-300 font-medium">Developer: </span>
                            <span className="text-slate-300">{game.steam_game.developer || 'Unknown (even more shameful)'}</span>
                            <div className="text-slate-400 text-[10px] mt-1">
                              {game.status === GameStatus.UNPLAYED ? 
                                'They worked hard, you bought it, now play it!' :
                                game.status === GameStatus.ABANDONED ?
                                'They put effort in, you gave up. Classic.' :
                                game.status === GameStatus.COMPLETED ?
                                'Finally, someone who appreciates good work!' :
                                'At least you\'re making progress.'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Play Now in Steam - Launch game directly */}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `steam://run/${game.steam_game.steam_app_id}`
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      title={`Launch ${game.steam_game.name} in Steam - Stop avoiding your library`}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    
                    {/* Mark as Playing - Update pile status */}
                    {game.status === GameStatus.UNPLAYED && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          showConfirmation('play', game)
                        }}
                        title="Mark as 'Currently Playing' in your pile (doesn't launch game)"
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Grant Amnesty - Free yourself from the guilt */}
                    {game.status === GameStatus.UNPLAYED && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          showConfirmation('amnesty', game)
                        }}
                        title="Grant amnesty and free yourself from the guilt"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGames.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <div className="text-slate-500 mb-2">No games found</div>
            <p className="text-sm text-slate-400">
              Try adjusting your filters or search term
            </p>
          </CardContent>
        </Card>
      )}

      {/* Floating Shame Popover (Desktop only) */}
      {hoveredGame && popoverPosition && (
        <div 
          className="fixed z-50 hidden sm:block pointer-events-none"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`
          }}
        >
          <div className="
            bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 
            rounded-2xl shadow-2xl p-5 w-80 max-w-sm 
            transform transition-all duration-300 animate-in
            ring-1 ring-white/10
          " style={{
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.8),
              0 10px 20px -5px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}>
            {/* Game Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-11 rounded-xl overflow-hidden bg-slate-800/50 flex-shrink-0 relative ring-1 ring-slate-600/30">
                {hoveredGame.steam_game.image_url ? (
                  <Image 
                    src={hoveredGame.steam_game.image_url}
                    alt={hoveredGame.steam_game.name}
                    width={80}
                    height={44}
                    className="object-cover w-full h-full"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Play className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-white/95 line-clamp-2 mb-2 leading-snug">
                  {hoveredGame.steam_game.name}
                </h3>
                <div className="text-center">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium backdrop-blur-sm ${
                    getStatusColor(hoveredGame.status)
                  }`}>
                    {hoveredGame.status.toUpperCase()}
                  </div>
                  {/* Roast message below the pill */}
                  <div className="text-xs text-slate-400 mt-1.5 italic">
                    {getStatusRoast(hoveredGame.status, hoveredGame)}
                  </div>
                </div>
              </div>
            </div>

            {/* Shame Content */}
            <div className="space-y-3 text-xs">
              {/* Brutal Ownership Truth */}
              {getSarcasticOwnership(hoveredGame) && (
                <div className="bg-red-950/20 backdrop-blur-sm p-3 rounded-xl border border-red-500/30 ring-1 ring-red-500/10">
                  <div className="text-red-300 font-semibold mb-1.5 text-xs">Ownership Shame</div>
                  <div className="text-slate-200 leading-relaxed text-xs">{getSarcasticOwnership(hoveredGame)}</div>
                </div>
              )}
              
              {/* Genre Mockery */}
              <div className="bg-yellow-950/20 backdrop-blur-sm p-3 rounded-xl border border-yellow-500/30 ring-1 ring-yellow-500/10">
                <div className="text-yellow-300 font-semibold mb-1.5 text-xs">Genre Psychology</div>
                <div className="text-slate-200 leading-relaxed text-xs">{getGenreShame(hoveredGame.steam_game.genres, hoveredGame.steam_game.name)}</div>
              </div>
              
              {/* Developer Support Guilt */}
              <div className="bg-purple-950/20 backdrop-blur-sm p-3 rounded-xl border border-purple-500/30 ring-1 ring-purple-500/10">
                <div className="text-purple-300 font-semibold mb-1.5 text-xs">Developer Support</div>
                <div className="text-slate-200 mb-1.5 text-xs font-medium">{hoveredGame.steam_game.developer || 'Unknown (even more shameful)'}</div>
                <div className="text-slate-400 text-[10px] leading-relaxed">
                  {hoveredGame.status === GameStatus.UNPLAYED ? 
                    'They worked hard, you bought it, now play it!' :
                    hoveredGame.status === GameStatus.ABANDONED ?
                    'They put effort in, you gave up. Classic.' :
                    hoveredGame.status === GameStatus.COMPLETED ?
                    'Finally, someone who appreciates good work!' :
                    'At least you\'re making progress.'
                  }
                </div>
              </div>

              {/* Click hint */}
              <div className="text-center pt-3 mt-4 border-t border-slate-700/30">
                <div className="text-xs text-slate-400/80 font-medium">
                  Click for full details & actions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmationDialog.isOpen && confirmationDialog.game && confirmationDialog.action && (
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={() => setConfirmationDialog({ isOpen: false, action: null, game: null })}
          onConfirm={handleConfirmAction}
          type="warning"
          {...getSarcasticConfirmation(confirmationDialog.action, confirmationDialog.game)}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}