'use client'

import React from 'react'
import { Hourglass, Flame, Crown, Feather, Skull } from 'lucide-react'

interface SacredRelicProps {
  status: 'unplayed' | 'playing' | 'completed' | 'amnesty'
  count: number
  className?: string
  isActive?: boolean
  onClick?: (status: string) => void
}

const relicConfig = {
  unplayed: {
    icon: Hourglass,
    title: 'The Broken Hourglass',
    subtitle: 'Time stands still for the forgotten',
    bgClass: 'from-red-950/20 to-orange-950/20',
    borderClass: 'border-red-900/30',
    glowClass: 'glow-unplayed',
    textClass: 'text-red-300',
    iconClass: 'text-red-400',
    statusVar: '--status-unplayed'
  },
  playing: {
    icon: Flame,
    title: 'The Sacred Flame',
    subtitle: 'The spark of determination burns',
    bgClass: 'from-yellow-950/20 to-orange-950/20',
    borderClass: 'border-yellow-700/30',
    glowClass: 'glow-playing',
    textClass: 'text-yellow-200',
    iconClass: 'text-yellow-400',
    statusVar: '--status-playing'
  },
  completed: {
    icon: Crown,
    title: 'The Victory Crown',
    subtitle: 'Glory earned through dedication',
    bgClass: 'from-green-950/20 to-emerald-950/20',
    borderClass: 'border-green-700/30',
    glowClass: 'glow-completed',
    textClass: 'text-green-200',
    iconClass: 'text-green-400',
    statusVar: '--status-completed'
  },
  amnesty: {
    icon: Feather,
    title: 'The Fallen Feather',
    subtitle: 'Peace granted, burden released',
    bgClass: 'from-blue-950/20 to-slate-950/20',
    borderClass: 'border-blue-800/30',
    glowClass: 'glow-amnesty',
    textClass: 'text-blue-200',
    iconClass: 'text-blue-400',
    statusVar: '--status-amnesty'
  }
}

export function SacredRelic({ status, count, className = '', isActive = false, onClick }: SacredRelicProps) {
  const config = relicConfig[status]
  const IconComponent = config.icon
  
  return (
    <div 
      className={`
        relative group cursor-pointer
        bg-gradient-to-br ${config.bgClass}
        border ${config.borderClass}
        rounded-2xl p-6
        sacred-relic-hover
        texture-overlay
        ${isActive ? `active ${config.glowClass} ring-2 ring-yellow-400/50` : ''}
        ${className}
      `}
      onClick={() => onClick?.(status)}
      style={{
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.05),
          0 4px 16px rgba(0, 0, 0, 0.3),
          0 8px 32px hsla(var(${config.statusVar}), ${isActive ? '0.3' : '0.1'})
        `
      }}
    >
      {/* Mystical Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--mystical-gold)_0%,_transparent_70%)] rounded-2xl" />
      
      {/* Icon Container */}
      <div className="flex items-center justify-center mb-4">
        <div className={`
          relative p-3 rounded-full
          bg-gradient-to-br from-black/20 to-transparent
          border border-white/10
          relic-icon sacred-pulse
        `}>
          <IconComponent 
            size={32} 
            className={`${config.iconClass} drop-shadow-lg`}
            style={{
              filter: `drop-shadow(0 0 8px hsla(var(${config.statusVar}), 0.5))`
            }}
          />
        </div>
      </div>
      
      {/* Count Display */}
      <div className="text-center mb-3">
        <div 
          className={`text-4xl font-bold ${config.textClass} mb-1`}
          style={{
            fontFamily: 'Crimson Text, serif',
            textShadow: `0 0 20px hsla(var(${config.statusVar}), 0.6)`
          }}
        >
          {count.toLocaleString()}
        </div>
        <div className={`text-xs font-medium ${config.textClass} opacity-80 uppercase tracking-wider`}>
          {status.replace('_', ' ')}
        </div>
      </div>
      
      {/* Mystical Title */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-300 mb-1" style={{ fontFamily: 'Crimson Text, serif' }}>
          {config.title}
        </div>
        <div className="text-xs text-gray-500 italic leading-relaxed">
          {config.subtitle}
        </div>
      </div>
      
      {/* Hover Glow Effect */}
      <div 
        className={`
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 
          transition-opacity duration-500 pointer-events-none
        `}
        style={{
          background: `radial-gradient(circle at center, hsla(var(${config.statusVar}), 0.3) 0%, transparent 70%)`
        }}
      />
      
      {/* Subtle Animation Sparkles */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-white/20 rounded-full animate-ping" />
      <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/30 rounded-full animate-pulse" />
    </div>
  )
}

// Sacred Altar Container Component
interface SacredAltarProps {
  pile: any[]
  className?: string
  activeFilter?: string | null
  onFilterChange?: (filter: string | null) => void
}

export function SacredAltar({ pile, className = '', activeFilter, onFilterChange }: SacredAltarProps) {
  const stats = {
    unplayed: pile.filter(entry => entry.status === 'unplayed').length,
    playing: pile.filter(entry => entry.status === 'playing').length,
    completed: pile.filter(entry => entry.status === 'completed').length,
    amnesty: pile.filter(entry => entry.status === 'amnesty_granted').length
  }
  
  const handleRelicClick = (status: string) => {
    // If clicking the active filter, clear it; otherwise set the new filter
    const newFilter = activeFilter === status ? null : status
    onFilterChange?.(newFilter)
  }
  
  return (
    <div className={`${className}`}>
      {/* Altar Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
          The Sacred Altar of Progress
        </h2>
        <p className="text-gray-400 text-sm italic">
          Where the echoes of your gaming journey find their eternal rest
        </p>
        {activeFilter && (
          <div className="mt-4">
            <p className="text-yellow-400 text-sm font-medium" style={{ fontFamily: 'Crimson Text, serif' }}>
              🔮 Viewing only: <span className="capitalize">{activeFilter.replace('_', ' ')}</span> games
            </p>
            <button 
              onClick={() => onFilterChange?.(null)}
              className="text-xs text-gray-500 hover:text-gray-300 underline mt-1"
            >
              Show all relics
            </button>
          </div>
        )}
      </div>
      
      {/* Sacred Relics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <SacredRelic 
          status="unplayed" 
          count={stats.unplayed}
          isActive={activeFilter === 'unplayed'}
          onClick={handleRelicClick}
        />
        <SacredRelic 
          status="playing" 
          count={stats.playing}
          isActive={activeFilter === 'playing'}
          onClick={handleRelicClick}
        />
        <SacredRelic 
          status="completed" 
          count={stats.completed}
          isActive={activeFilter === 'completed'}
          onClick={handleRelicClick}
        />
        <SacredRelic 
          status="amnesty" 
          count={stats.amnesty}
          isActive={activeFilter === 'amnesty_granted'}
          onClick={(status) => handleRelicClick('amnesty_granted')}
        />
      </div>
    </div>
  )
}