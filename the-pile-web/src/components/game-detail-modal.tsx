'use client'

import React, { useEffect, useState } from 'react'
import { X, Calendar, Clock, DollarSign, Tag, Star, Play, Feather, ExternalLink, Trophy, AlertTriangle, GamepadIcon, Download, Activity, Edit3, Save, FileText } from 'lucide-react'
import { Button } from './ui/button'
import { IconButton } from './ui/icon-button'
import { ToastContainer } from './ui/toast'
import { useToast } from '@/lib/use-toast'
import Image from 'next/image'

interface GameDetailModalProps {
  isOpen: boolean
  onClose: () => void
  game: {
    id: string
    status: 'unplayed' | 'playing' | 'completed' | 'abandoned' | 'amnesty_granted'
    playtime_minutes: number
    purchase_date?: string
    notes?: string
    steam_game: {
      steam_app_id: number
      name: string
      image_url?: string
      price?: number
      genres?: string[]
      description?: string
      developer?: string
      publisher?: string
      release_date?: string
      rtime_last_played?: number
      tags?: string[]
      screenshots?: string[]
      achievements_total?: number
      metacritic_score?: number
      positive_reviews?: number
      negative_reviews?: number
    }
  }
  onGrantAmnesty?: (gameId: string) => void
  onStartPlaying?: (gameId: string) => void
  onMarkCompleted?: (gameId: string) => void
  onUpdateNotes?: (gameId: string, notes: string) => void
}

const statusConfig = {
  unplayed: {
    color: 'text-red-300',
    bgColor: 'bg-red-950/20',
    borderColor: 'border-red-800/40',
    label: 'Awaiting Your Touch',
    icon: '⏳'
  },
  playing: {
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-950/20',
    borderColor: 'border-yellow-700/40',
    label: 'Currently Active',
    icon: '🔥'
  },
  completed: {
    color: 'text-green-300',
    bgColor: 'bg-green-950/20',
    borderColor: 'border-green-700/40',
    label: 'Journey Complete',
    icon: '👑'
  },
  abandoned: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-950/20',
    borderColor: 'border-gray-700/40',
    label: 'Lost to Time',
    icon: '💀'
  },
  amnesty_granted: {
    color: 'text-blue-300',
    bgColor: 'bg-blue-950/20',
    borderColor: 'border-blue-800/40',
    label: 'Granted Peace',
    icon: '🕊️'
  }
}

export function GameDetailModal({ 
  isOpen, 
  onClose, 
  game, 
  onGrantAmnesty, 
  onStartPlaying, 
  onMarkCompleted,
  onUpdateNotes
}: GameDetailModalProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'playing' | 'completed' | 'amnesty' | null,
    message: string,
    action: () => void
  } | null>(null)
  
  // Notes functionality
  const [notes, setNotes] = useState(game.notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesBeingEdited, setNotesBeingEdited] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  
  // Action loading states
  const [actionLoading, setActionLoading] = useState<{
    playing?: boolean
    completed?: boolean
    amnesty?: boolean
  }>({})
  
  // Toast notifications
  const { toasts, success, error, dismissToast } = useToast()

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDialog) {
          setConfirmDialog(null)
        } else {
          onClose()
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, confirmDialog])

  if (!isOpen || !game) return null

  const config = statusConfig[game.status] || statusConfig.unplayed
  const steamUrl = game.steam_game?.steam_app_id 
    ? `https://store.steampowered.com/app/${game.steam_game.steam_app_id}`
    : '#'
  const steamPlayUrl = game.steam_game?.steam_app_id 
    ? `steam://run/${game.steam_game.steam_app_id}`
    : null
  const steamInstallUrl = game.steam_game?.steam_app_id 
    ? `steam://install/${game.steam_game.steam_app_id}`
    : null
  
  const formatPlaytime = (minutes: number) => {
    if (minutes === 0) return 'Never played'
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours < 24) return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h total`
  }

  const getReviewScore = () => {
    const total = (game.steam_game.positive_reviews || 0) + (game.steam_game.negative_reviews || 0)
    if (total === 0) return null
    const percentage = Math.round(((game.steam_game.positive_reviews || 0) / total) * 100)
    return { percentage, total }
  }

  const reviewScore = getReviewScore()

  // Steam play/install motivational messaging with therapeutic roasting
  const getPlayNowMotivation = () => {
    const price = game.steam_game.price || 0
    const daysSinceRelease = game.steam_game.release_date ? 
      Math.floor((Date.now() - new Date(game.steam_game.release_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
    const hours = Math.floor(game.playtime_minutes / 60)

    if (game.status === 'unplayed') {
      if (game.playtime_minutes === 0) {
        if (price > 40) return "Finally Launch Your $" + price + " Regret"
        if (daysSinceRelease > 730) return "It's About Time"
        return "Actually Play This?"
      }
      if (hours < 2) return "Give It Another Shot"
      return "Continue Where You Left Off"
    }
    
    if (game.status === 'playing') {
      if (hours < 5) return "Keep Going This Time"
      return "Back to Your Journey"
    }
    
    if (game.status === 'abandoned') {
      return "One More Try?"
    }
    
    return "Play Now"
  }

  const getInstallMotivation = () => {
    const price = game.steam_game.price || 0
    
    if (price > 30) return "Download Your $" + price + " Shame"
    if (price === 0) return "Install Your Free Guilt"
    return "Finally Download This?"
  }

  const getPlayNowTooltip = () => {
    const price = game.steam_game.price || 0
    const daysSinceRelease = game.steam_game.release_date ? 
      Math.floor((Date.now() - new Date(game.steam_game.release_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
    const yearsSinceRelease = Math.floor(daysSinceRelease / 365)
    const hours = Math.floor(game.playtime_minutes / 60)

    if (game.status === 'unplayed' && game.playtime_minutes === 0) {
      if (price > 40) {
        return `You spent $${price} on this ${yearsSinceRelease > 0 ? yearsSinceRelease + ' year' + (yearsSinceRelease > 1 ? 's' : '') + ' ago' : 'recently'} and haven't even launched it once. Maybe today's the day you finally get your money's worth?`
      }
      if (daysSinceRelease > 730) {
        return `This game has been waiting ${yearsSinceRelease} year${yearsSinceRelease > 1 ? 's' : ''} for you to press play. Your Steam library is starting to feel like a digital graveyard.`
      }
      if (price === 0) {
        return `It's free and you still won't play it. Even when there's no financial commitment, you find ways to procrastinate.`
      }
      return `Time to stop staring at your library and actually launch something. Your backlog isn't going to play itself.`
    }
    
    if (game.status === 'playing') {
      if (hours < 5) {
        return `You marked this as "playing" but only have ${hours} hour${hours !== 1 ? 's' : ''} logged. Time to show some actual commitment.`
      }
      return `Back to your ${hours}-hour journey. At least you're making progress on something.`
    }
    
    if (game.status === 'abandoned') {
      return `You gave up on this once before. Will this time be different, or are we just delaying the inevitable amnesty?`
    }
    
    return `Launch directly in Steam. No more excuses.`
  }

  // Sarcastic button text and confirmation messages
  const getSarcasticPlayingButton = () => {
    const daysSinceRelease = game.steam_game.release_date ? 
      Math.floor((Date.now() - new Date(game.steam_game.release_date).getTime()) / (1000 * 60 * 60 * 24)) : 0

    if (game.status === 'unplayed') {
      if (game.playtime_minutes === 0) {
        if (daysSinceRelease > 365) return "Mark as Playing"
        return "Mark as Playing"
      }
      return "Mark as Playing"
    }
    return "Mark as Playing"
  }

  const getSarcasticPlayingConfirm = () => {
    const price = game.steam_game.price || 0
    const daysSinceRelease = game.steam_game.release_date ? 
      Math.floor((Date.now() - new Date(game.steam_game.release_date).getTime()) / (1000 * 60 * 60 * 24)) : 0

    if (game.status === 'unplayed') {
      if (game.playtime_minutes === 0) {
        if (price > 30) {
          return `Really? You're going to start playing "${game.steam_game.name}" after ignoring your $${price} investment? Bold move. Let's see if you actually follow through this time.`
        }
        if (daysSinceRelease > 365) {
          return `"${game.steam_game.name}" has been waiting ${Math.floor(daysSinceRelease/365)} year${Math.floor(daysSinceRelease/365) > 1 ? 's' : ''} for you. Think you're finally ready to commit?`
        }
        return `Starting "${game.steam_game.name}" for the first time? How optimistic of you. Try not to abandon it like the others.`
      }
      return `Going back to "${game.steam_game.name}"? Last time you played for ${Math.floor(game.playtime_minutes/60)}h${game.playtime_minutes%60}m before giving up. Third time's the charm?`
    }
    return `Mark "${game.steam_game.name}" as currently playing?`
  }

  const getSarcasticCompletedButton = () => {
    if (game.playtime_minutes < 60) return "Completed Already?"
    if (game.playtime_minutes < 300) return "That Was Quick"
    return "Actually Finished?"
  }

  const getSarcasticCompletedConfirm = () => {
    const hours = Math.floor(game.playtime_minutes / 60)
    
    if (game.playtime_minutes < 60) {
      return `"${game.steam_game.name}" completed in under an hour? Either it's a very short game or you're being... generous with the definition of "completed."`
    }
    if (hours < 5) {
      return `${hours} hours and you're calling "${game.steam_game.name}" completed? Well, congratulations on actually finishing something for once.`
    }
    if (hours > 100) {
      return `${hours} hours in "${game.steam_game.name}"? That's either dedication or procrastination from real life. Either way, congrats on the completion!`
    }
    return `Mark "${game.steam_game.name}" as completed after ${hours} hours? Finally, a success story!`
  }

  const getSarcasticAmnestyButton = () => {
    if (game.status === 'unplayed') return "Give Up Hope"
    if (game.status === 'playing') return "Throw in Towel"
    return "Grant Peace"
  }

  const getSarcasticAmnestyConfirm = () => {
    const price = game.steam_game.price || 0
    const hours = Math.floor(game.playtime_minutes / 60)

    if (game.status === 'unplayed') {
      if (price > 30) {
        return `Giving up on "${game.steam_game.name}" without even trying? That's $${price} down the drain. At least you're honest about your lack of commitment.`
      }
      return `Granting amnesty to "${game.steam_game.name}" without a single minute played? Sometimes acceptance is the first step to healing.`
    }
    
    if (game.status === 'playing') {
      if (hours < 2) {
        return `Already giving up on "${game.steam_game.name}" after ${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : 'less than an hour'}? Quick to surrender, aren't we?`
      }
      return `Abandoning "${game.steam_game.name}" after ${hours} hours? At least you gave it a fair shot before admitting defeat.`
    }

    return `Grant amnesty to "${game.steam_game.name}"? Sometimes letting go is the kindest thing you can do.`
  }

  const handleActionWithConfirm = (type: 'playing' | 'completed' | 'amnesty') => {
    let message = ''
    let action = async () => {}

    switch(type) {
      case 'playing':
        message = getSarcasticPlayingConfirm()
        action = async () => {
          setActionLoading(prev => ({ ...prev, playing: true }))
          try {
            await onStartPlaying?.(game.id)
            success('Status updated', `"${game.steam_game.name}" marked as playing. Time to actually play it!`)
          } catch (err) {
            error('Failed to update status', 'Please try again.')
          } finally {
            setActionLoading(prev => ({ ...prev, playing: false }))
          }
        }
        break
      case 'completed':
        message = getSarcasticCompletedConfirm()
        action = async () => {
          setActionLoading(prev => ({ ...prev, completed: true }))
          try {
            await onMarkCompleted?.(game.id)
            success('Game completed!', `Congratulations on finishing "${game.steam_game.name}"! 🎉`)
          } catch (err) {
            error('Failed to update status', 'Please try again.')
          } finally {
            setActionLoading(prev => ({ ...prev, completed: false }))
          }
        }
        break
      case 'amnesty':
        message = getSarcasticAmnestyConfirm()
        action = async () => {
          setActionLoading(prev => ({ ...prev, amnesty: true }))
          try {
            await onGrantAmnesty?.(game.id)
            success('Amnesty granted', `"${game.steam_game.name}" has been set free from your pile. Peace at last. 🕊️`)
          } catch (err) {
            error('Failed to grant amnesty', 'Please try again.')
          } finally {
            setActionLoading(prev => ({ ...prev, amnesty: false }))
          }
        }
        break
    }

    setConfirmDialog({ type, message, action })
  }

  const executeConfirmedAction = () => {
    if (confirmDialog) {
      confirmDialog.action()
      setConfirmDialog(null)
    }
  }

  // Notes handling functions
  const startEditingNotes = () => {
    setNotesBeingEdited(notes)
    setIsEditingNotes(true)
  }

  const cancelEditingNotes = () => {
    setNotesBeingEdited('')
    setIsEditingNotes(false)
  }

  const saveNotes = async () => {
    setIsSavingNotes(true)
    try {
      setNotes(notesBeingEdited)
      await onUpdateNotes?.(game.id, notesBeingEdited)
      setIsEditingNotes(false)
      setNotesBeingEdited('')
      success('Notes saved', 'Your personal notes have been updated successfully.')
    } catch (err) {
      error('Failed to save notes', 'Please try again.')
    } finally {
      setIsSavingNotes(false)
    }
  }

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-fix"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="
        relative w-full max-w-4xl max-h-[90vh] mx-4
        bg-gradient-to-br from-purple-950/30 to-black/30
        border border-purple-800/30 rounded-2xl
        overflow-hidden shadow-2xl
        texture-overlay
      " style={{
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.05),
          0 20px 60px rgba(0, 0, 0, 0.5),
          0 0 100px hsla(var(--mystical-gold), 0.1)
        `
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full
                   bg-black/50 hover:bg-black/70 
                   text-gray-400 hover:text-white
                   transition-all duration-200"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex flex-col max-h-[90vh] overflow-hidden">
          {/* Hero Section - Game Art as Centerpiece */}
          <div className="relative">
            {/* Background Image with Overlay */}
            <div className="relative h-64 lg:h-80 overflow-hidden">
              <Image
                src={game.steam_game?.image_url || '/default-game.svg'}
                alt={game.steam_game?.name || 'Unknown Game'}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                onError={(e) => {
                  e.currentTarget.src = '/default-game.svg'
                }}
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
            </div>
            
            {/* Hero Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end justify-between">
                {/* Title and Meta Info */}
                <div className="flex-1 mr-4">
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-white drop-shadow-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
                    {game.steam_game?.name || 'Unknown Game'}
                  </h1>
                  
                  {/* Developer, Publisher, Year, Price - Consolidated */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200 mb-3">
                    {game.steam_game?.developer && (
                      <span className="bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        {game.steam_game.developer}
                      </span>
                    )}
                    {game.steam_game?.release_date && (
                      <span className="bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        {new Date(game.steam_game.release_date).getFullYear()}
                      </span>
                    )}
                    {game.steam_game?.price && (
                      <span className="bg-black/40 px-2 py-1 rounded backdrop-blur-sm text-yellow-300">
                        ${game.steam_game.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Primary Action - Prominent Play Now Button */}
                  <div className="flex items-center gap-3">
                    {steamPlayUrl && (
                      <IconButton
                        size="lg"
                        onClick={() => window.location.href = steamPlayUrl}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                        icon={Play}
                        iconSize="lg"
                      >
                        {getPlayNowMotivation()}
                      </IconButton>
                    )}
                    
                    {steamUrl !== '#' && (
                      <IconButton
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(steamUrl, '_blank')}
                        className="bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm"
                        icon={ExternalLink}
                        iconSize="sm"
                      >
                        Steam Store
                      </IconButton>
                    )}
                  </div>
                </div>
                
                {/* Status Badge - Floating on the right */}
                <div className={`
                  ${config.bgColor} ${config.borderColor}
                  border rounded-xl p-4 backdrop-blur-sm bg-opacity-90
                  shadow-lg
                `}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div className="text-right">
                      <h3 className={`font-semibold ${config.color} text-lg`}>
                        {config.label}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {formatPlaytime(game.playtime_minutes)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          {/* Main Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Secondary Actions & Status Management */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Manage Your Pile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {game.status !== 'playing' && (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleActionWithConfirm('playing')}
                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 border border-yellow-600/30 hover:border-yellow-500/50"
                    title="Mark this game as currently playing in your pile"
                    icon={Activity}
                    iconSize="sm"
                    loading={actionLoading.playing}
                    loadingText="Updating..."
                  >
                    {getSarcasticPlayingButton()}
                  </IconButton>
                )}
                
                {game.status !== 'completed' && (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleActionWithConfirm('completed')}
                    className="text-green-400 hover:text-green-300 hover:bg-green-400/10 border border-green-600/30 hover:border-green-500/50"
                    icon={Trophy}
                    iconSize="sm"
                    loading={actionLoading.completed}
                    loadingText="Updating..."
                  >
                    {getSarcasticCompletedButton()}
                  </IconButton>
                )}
                
                {game.status !== 'amnesty_granted' && (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleActionWithConfirm('amnesty')}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 border border-purple-600/30 hover:border-purple-500/50"
                    icon={Feather}
                    iconSize="sm"
                    loading={actionLoading.amnesty}
                    loadingText="Granting..."
                  >
                    {getSarcasticAmnestyButton()}
                  </IconButton>
                )}
              </div>
            </div>

            {/* Game Stats & Metadata - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Game Details */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Game Details</h3>
                <div className="space-y-3">
                  {/* Playtime vs Last Played */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Playtime:</span>
                    <span className="text-white font-medium">{formatPlaytime(game.playtime_minutes)}</span>
                  </div>
                  
                  {game.steam_game.rtime_last_played && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Played:</span>
                      <span className="text-gray-300">
                        {new Date(game.steam_game.rtime_last_played * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {game.steam_game?.publisher && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Publisher:</span>
                      <span className="text-gray-300">{game.steam_game.publisher}</span>
                    </div>
                  )}
                  
                  {game.steam_game?.metacritic_score && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Metacritic:</span>
                      <span className={`font-medium ${
                        game.steam_game.metacritic_score >= 80 ? 'text-green-400' : 
                        game.steam_game.metacritic_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {game.steam_game.metacritic_score}/100
                      </span>
                    </div>
                  )}
                  
                  {game.steam_game?.achievements_total && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Achievements:</span>
                      <span className="text-gray-300 flex items-center">
                        <Trophy size={14} className="mr-1 text-yellow-500" />
                        {game.steam_game.achievements_total} total
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags & Genres Combined */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Categories</h3>
                <div className="space-y-3">
                  {game.steam_game?.genres && game.steam_game.genres.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-400 block mb-2">Genres:</span>
                      <div className="flex flex-wrap gap-2">
                        {game.steam_game.genres.map(genre => (
                          <span 
                            key={genre}
                            className="px-3 py-1 bg-purple-950/30 border border-purple-800/30 rounded-full text-sm text-purple-200"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {game.steam_game?.tags && game.steam_game.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-400 block mb-2">Popular Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {game.steam_game.tags.slice(0, 6).map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-gray-800/50 border border-gray-600/30 rounded text-xs text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Reviews & Community - Full Width */}
            {reviewScore && (
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Community Reviews
                </h3>
                
                {/* Review Score with Personality */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${
                      reviewScore.percentage >= 80 ? 'text-green-400' : 
                      reviewScore.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {reviewScore.percentage}%
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {reviewScore.percentage >= 90 ? 'Overwhelmingly Positive' : 
                         reviewScore.percentage >= 80 ? 'Very Positive' :
                         reviewScore.percentage >= 70 ? 'Mostly Positive' :
                         reviewScore.percentage >= 60 ? 'Mixed' : 
                         reviewScore.percentage >= 40 ? 'Mostly Negative' : 'Overwhelmingly Negative'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {reviewScore.total.toLocaleString()} user reviews
                      </div>
                    </div>
                  </div>
                  
                  {/* Sarcastic Commentary */}
                  <div className="text-xs text-gray-500 italic max-w-xs text-right">
                    {game.status === 'unplayed' ? 
                      'Everyone but you loves this' :
                      game.status === 'abandoned' ?
                      'Even this got more love than your attention span' :
                      game.status === 'completed' ?
                      'You and the community actually agree on something!' :
                      'At least you\'re making progress like everyone else'
                    }
                  </div>
                </div>

                {/* Review Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400 flex items-center gap-2">
                      👍 Positive
                    </span>
                    <span className="text-gray-300">
                      {(game.steam_game?.positive_reviews || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-400 flex items-center gap-2">
                      👎 Negative
                    </span>
                    <span className="text-gray-300">
                      {(game.steam_game?.negative_reviews || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Review Bar */}
                <div className="mt-3 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      reviewScore.percentage >= 80 ? 'bg-green-500' : 
                      reviewScore.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${reviewScore.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {game.steam_game?.description && (
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center">
                  📝 About This Game
                </h3>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {game.steam_game.description.length > 400 
                      ? `${game.steam_game.description.substring(0, 400)}...`
                      : game.steam_game.description
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Personal Notes Section */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Personal Notes
                </h3>
                {!isEditingNotes && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={startEditingNotes}
                    className="text-gray-400 hover:text-gray-200"
                    icon={Edit3}
                    iconSize="sm"
                  >
                    {notes ? 'Edit' : 'Add Note'}
                  </IconButton>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesBeingEdited}
                    onChange={(e) => setNotesBeingEdited(e.target.value)}
                    placeholder="Add your thoughts about this game... Maybe why you bought it, what you hope to get from it, or reminders for when you play..."
                    className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditingNotes}
                      className="text-gray-400 hover:text-gray-200"
                      icon={X}
                      iconSize="sm"
                    >
                      Cancel
                    </IconButton>
                    <IconButton
                      variant="outline"
                      size="sm"
                      onClick={saveNotes}
                      className="text-blue-400 border-blue-600/30 hover:bg-blue-600/10"
                      icon={Save}
                      iconSize="sm"
                      loading={isSavingNotes}
                      loadingText="Saving..."
                    >
                      Save Note
                    </IconButton>
                  </div>
                </div>
              ) : (
                <div className="min-h-[60px] flex items-center">
                  {notes ? (
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {notes}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No notes yet. Click &quot;Add Note&quot; to record your thoughts about this game.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Screenshots */}
            {game.steam_game?.screenshots && game.steam_game.screenshots.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center">
                  🖼️ Screenshots
                  <span className="ml-2 text-sm text-gray-400 font-normal">
                    ({game.steam_game.screenshots.length} total)
                  </span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {game.steam_game.screenshots.slice(0, 6).map((screenshot, index) => (
                    <div 
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden bg-gray-800/50 cursor-pointer hover:scale-105 transition-transform duration-200 group"
                      onClick={() => window.open(screenshot, '_blank')}
                    >
                      <Image
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:opacity-90"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                        <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
                {game.steam_game.screenshots.length > 6 && (
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    +{game.steam_game.screenshots.length - 6} more screenshots • Click to view full size
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setConfirmDialog(null)}
          />
          <div className="relative bg-slate-900 border border-slate-600 rounded-xl p-6 max-w-lg mx-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Hold Up There...</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {confirmDialog.message}
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDialog(null)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    Never Mind
                  </Button>
                  <Button
                    size="sm"
                    onClick={executeConfirmedAction}
                    className={`
                      ${confirmDialog.type === 'playing' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
                      ${confirmDialog.type === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                      ${confirmDialog.type === 'amnesty' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                    `}
                  >
                    {confirmDialog.type === 'playing' && "Yes, I'll Try"}
                    {confirmDialog.type === 'completed' && "Mark Complete"}
                    {confirmDialog.type === 'amnesty' && "Grant Amnesty"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}