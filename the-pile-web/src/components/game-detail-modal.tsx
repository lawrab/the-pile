'use client'

import React, { useEffect } from 'react'
import { X, Calendar, Clock, DollarSign, Tag, Star, Play, Feather, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'

interface GameDetailModalProps {
  isOpen: boolean
  onClose: () => void
  game: {
    id: string
    status: 'unplayed' | 'playing' | 'completed' | 'abandoned' | 'amnesty_granted'
    playtime_minutes: number
    purchase_date?: string
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
  onMarkCompleted 
}: GameDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const config = statusConfig[game.status]
  const steamUrl = `https://store.steampowered.com/app/${game.steam_game.steam_app_id}`
  
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
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
        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Left Column - Image & Status */}
          <div className="lg:w-1/2 p-6">
            {/* Game Image */}
            <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gray-900/50">
              <img
                src={game.steam_game.image_url || '/default-game.svg'}
                alt={game.steam_game.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-game.svg'
                }}
              />
            </div>

            {/* Status Card */}
            <div className={`
              ${config.bgColor} ${config.borderColor}
              border rounded-xl p-4 mb-4
            `}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className={`font-semibold ${config.color}`}>
                    {config.label}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {formatPlaytime(game.playtime_minutes)}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                {game.status === 'unplayed' && (
                  <>
                    <Button
                      size="sm"
                      variant="playing"
                      onClick={() => onStartPlaying?.(game.id)}
                      className="flex-1"
                    >
                      <Play size={14} className="mr-1" />
                      Begin Quest
                    </Button>
                    <Button
                      size="sm"
                      variant="amnesty"
                      onClick={() => onGrantAmnesty?.(game.id)}
                      className="flex-1"
                    >
                      <Feather size={14} className="mr-1" />
                      Grant Peace
                    </Button>
                  </>
                )}
                
                {game.status === 'playing' && (
                  <Button
                    size="sm"
                    variant="completed"
                    onClick={() => onMarkCompleted?.(game.id)}
                    className="w-full"
                  >
                    <Star size={14} className="mr-1" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {game.steam_game.price && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <DollarSign size={16} />
                  <span>${game.steam_game.price.toFixed(2)}</span>
                </div>
              )}
              
              {game.steam_game.release_date && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span>{new Date(game.steam_game.release_date).getFullYear()}</span>
                </div>
              )}
              
              {game.steam_game.metacritic_score && (
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-yellow-400">{game.steam_game.metacritic_score}/100</span>
                </div>
              )}
              
              {reviewScore && (
                <div className="flex items-center gap-2">
                  <span className={reviewScore.percentage >= 80 ? 'text-green-400' : reviewScore.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                    {reviewScore.percentage}%
                  </span>
                  <span className="text-gray-500 text-xs">({reviewScore.total.toLocaleString()} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            {/* Game Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                {game.steam_game.name}
              </h1>
              
              {game.steam_game.developer && (
                <p className="text-gray-400 mb-1">
                  <strong>Developer:</strong> {game.steam_game.developer}
                </p>
              )}
              
              {game.steam_game.publisher && (
                <p className="text-gray-400 mb-4">
                  <strong>Publisher:</strong> {game.steam_game.publisher}
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(steamUrl, '_blank')}
                className="mb-4"
              >
                <ExternalLink size={14} className="mr-2" />
                View on Steam
              </Button>
            </div>

            {/* Genres */}
            {game.steam_game.genres && game.steam_game.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Genres
                </h3>
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

            {/* Tags */}
            {game.steam_game.tags && game.steam_game.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.steam_game.tags.slice(0, 8).map(tag => (
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

            {/* Description */}
            {game.steam_game.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                  About This Game
                </h3>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {game.steam_game.description.length > 500 
                      ? `${game.steam_game.description.substring(0, 500)}...`
                      : game.steam_game.description
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Achievements */}
            {game.steam_game.achievements_total && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Achievements
                </h3>
                <div className="flex items-center gap-2 text-gray-300">
                  <Trophy size={16} className="text-yellow-500" />
                  <span>{game.steam_game.achievements_total} total achievements</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}