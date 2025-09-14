'use client'

import React from 'react'
import { Button } from './ui/button'
import { Clock, Zap, Crown, Feather, Play, X } from 'lucide-react'
import Image from 'next/image'

interface GameTombstoneProps {
  entry: {
    id: string
    status: 'unplayed' | 'playing' | 'completed' | 'abandoned' | 'amnesty_granted'
    playtime_minutes: number
    steam_game: {
      name: string
      image_url?: string
      price?: number
      genres?: string[]
    }
  }
  onGrantAmnesty?: (gameId: string) => void
  onStartPlaying?: (gameId: string) => void
  onGameClick?: (game: any) => void
}

const statusConfig = {
  unplayed: {
    icon: Clock,
    bgClass: 'from-red-950/30 to-orange-950/20',
    borderClass: 'border-red-800/40',
    textClass: 'text-red-300',
    statusText: 'Awaiting Judgment',
    glowClass: 'glow-unplayed',
    filterClass: 'game-unplayed'
  },
  playing: {
    icon: Zap,
    bgClass: 'from-yellow-950/30 to-orange-950/20',
    borderClass: 'border-yellow-700/40',
    textClass: 'text-yellow-300',
    statusText: 'Under the Sacred Flame',
    glowClass: 'glow-playing',
    filterClass: ''
  },
  completed: {
    icon: Crown,
    bgClass: 'from-green-950/30 to-emerald-950/20',
    borderClass: 'border-green-700/40',
    textClass: 'text-green-300',
    statusText: 'Crowned in Glory',
    glowClass: 'glow-completed',
    filterClass: ''
  },
  abandoned: {
    icon: X,
    bgClass: 'from-gray-950/30 to-slate-950/20',
    borderClass: 'border-gray-700/40',
    textClass: 'text-gray-400',
    statusText: 'Lost to Time',
    glowClass: '',
    filterClass: 'grayscale'
  },
  amnesty_granted: {
    icon: Feather,
    bgClass: 'from-blue-950/30 to-slate-950/20',
    borderClass: 'border-blue-800/40',
    textClass: 'text-blue-300',
    statusText: 'At Eternal Peace',
    glowClass: 'glow-amnesty',
    filterClass: 'opacity-75'
  }
}

export function GameTombstone({ 
  entry, 
  onGrantAmnesty, 
  onStartPlaying,
  onGameClick
}: GameTombstoneProps) {
  const config = statusConfig[entry.status]
  const StatusIcon = config.icon
  
  const formatPlaytime = (minutes: number) => {
    if (minutes === 0) return 'Never touched'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours < 24) return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }
  
  return (
    <div 
      className={`
        relative group
        bg-gradient-to-br ${config.bgClass}
        border ${config.borderClass}
        rounded-xl p-4
        tomb-hover texture-overlay transform-gpu
        transition-all duration-300
        ${config.filterClass}
      `}
      style={{
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.05),
          0 2px 8px rgba(0, 0, 0, 0.3)
        `
      }}
    >
      {/* Mystical Aura */}
      <div 
        className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 
          transition-opacity duration-300 pointer-events-none
          ${config.glowClass}
        `}
      />
      
      {/* Game Cover Art */}
      <div className="relative mb-3">
        <div 
          className="aspect-video rounded-lg overflow-hidden bg-gray-900/50 cursor-pointer"
          onClick={() => onGameClick?.(entry)}
        >
          <Image
            src={entry.steam_game.image_url || '/default-game.svg'}
            alt={entry.steam_game.name}
            fill
            className={`
              object-cover
              transition-all duration-300 group-hover:scale-105
              ${entry.status === 'unplayed' ? 'grayscale-[0.6] group-hover:grayscale-[0.2]' : ''}
            `}
            onError={(e) => {
              e.currentTarget.src = '/default-game.svg'
            }}
          />
        </div>
        
        {/* Status Icon Overlay */}
        <div className={`
          absolute top-2 right-2 
          p-1.5 rounded-full
          bg-black/60 backdrop-blur-fix
          border border-white/10
        `}>
          <StatusIcon size={14} className={config.textClass} />
        </div>
        
        {/* Playtime Badge */}
        <div className={`
          absolute bottom-2 left-2
          px-2 py-1 rounded-md text-xs
          bg-black/80 backdrop-blur-fix
          border border-white/10
          ${config.textClass}
        `}>
          {formatPlaytime(entry.playtime_minutes)}
        </div>
      </div>
      
      {/* Game Information */}
      <div className="space-y-2">
        <h3 
          className={`font-semibold text-sm leading-tight ${config.textClass} group-hover:text-white transition-colors cursor-pointer`}
          style={{ fontFamily: 'Crimson Text, serif' }}
          title={entry.steam_game.name}
          onClick={() => onGameClick?.(entry)}
        >
          {entry.steam_game.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 italic">
            {config.statusText}
          </span>
          
          {entry.steam_game.price && (
            <span className="text-yellow-600 font-medium">
              ${entry.steam_game.price.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Genres */}
        {entry.steam_game.genres && entry.steam_game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.steam_game.genres.slice(0, 2).map(genre => (
              <span 
                key={genre}
                className="px-1.5 py-0.5 text-xs rounded bg-white/5 text-gray-400"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        {entry.status === 'unplayed' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs hover:glow-playing"
              onClick={() => onStartPlaying?.(entry.id)}
            >
              <Play size={12} className="mr-1" />
              Begin Quest
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs hover:glow-amnesty"
              onClick={() => onGrantAmnesty?.(entry.id)}
            >
              <Feather size={12} className="mr-1" />
              Grant Peace
            </Button>
          </>
        )}
        
        {entry.status === 'playing' && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled
          >
            <Zap size={12} className="mr-1" />
            In Progress
          </Button>
        )}
        
        {entry.status === 'completed' && (
          <div className="w-full text-center">
            <span className="text-xs text-green-400 italic">
              ✨ Journey Complete ✨
            </span>
          </div>
        )}
      </div>
      
      {/* Mystical Sparkle Effect */}
      <div className="absolute top-1 left-1 w-1 h-1 bg-white/30 rounded-full animate-pulse" />
      <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping" />
    </div>
  )
}

// Game Graveyard Container
interface GameGraveyardProps {
  pile: any[]
  onGrantAmnesty?: (gameId: string) => void
  onStartPlaying?: (gameId: string) => void
  onGameClick?: (game: any) => void
  className?: string
  activeFilter?: string | null
}

export function GameGraveyard({ 
  pile, 
  onGrantAmnesty, 
  onStartPlaying, 
  onGameClick,
  className = '',
  activeFilter
}: GameGraveyardProps) {
  // Filter the pile based on active filter
  const filteredPile = activeFilter 
    ? pile.filter(entry => entry.status === activeFilter)
    : pile

  const getGraveyardTitle = () => {
    if (!activeFilter) return "🪦 The Digital Graveyard"
    
    const filterTitles = {
      'unplayed': '⏳ The Realm of Broken Promises',
      'playing': '🔥 The Sacred Battlegrounds', 
      'completed': '👑 The Hall of Glory',
      'amnesty_granted': '🕊️ The Garden of Peace'
    }
    
    return filterTitles[activeFilter as keyof typeof filterTitles] || "🪦 The Digital Graveyard"
  }

  const getGraveyardDescription = () => {
    if (!activeFilter) return "Each tombstone tells a story of promises made and dreams deferred"
    
    const descriptions = {
      'unplayed': 'Here lie the games that remain untouched, waiting for their moment of awakening',
      'playing': 'These noble souls burn bright with the flame of active engagement',
      'completed': 'Behold the champions who have reached journey\'s end in triumph',
      'amnesty_granted': 'Here rest the pardoned, released from the burden of obligation'
    }
    
    return descriptions[activeFilter as keyof typeof descriptions] || "Each tombstone tells a story of promises made and dreams deferred"
  }
  
  return (
    <div className={className}>
      {/* Graveyard Title */}
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold mb-2" 
          style={{ fontFamily: 'Crimson Text, serif' }}
        >
          {getGraveyardTitle()}
        </h2>
        <p className="text-gray-400 text-sm italic leading-relaxed">
          {getGraveyardDescription()}
        </p>
        {activeFilter && (
          <div className="mt-2 text-xs text-yellow-500">
            Showing {filteredPile.length} of {pile.length} games
          </div>
        )}
      </div>
      
      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {filteredPile.map((entry) => (
          <GameTombstone 
            key={entry.id} 
            entry={entry}
            onGrantAmnesty={onGrantAmnesty}
            onStartPlaying={onStartPlaying}
            onGameClick={onGameClick}
          />
        ))}
      </div>
      
      {filteredPile.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">
            {activeFilter ? '🔮' : '🌸'}
          </div>
          <p className="text-gray-500 italic">
            {activeFilter 
              ? `No games found in the ${activeFilter.replace('_', ' ')} realm...`
              : 'The graveyard stands empty, awaiting the first fallen dreams...'
            }
          </p>
        </div>
      )}
    </div>
  )
}