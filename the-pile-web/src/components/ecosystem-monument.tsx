'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Tooltip } from './ui/tooltip'

interface EcosystemGame {
  id: string | number
  name: string
  status: 'unplayed' | 'playing' | 'completed' | 'abandoned' | 'amnesty_granted'
  playtime_minutes: number
}

interface EcosystemMonumentProps {
  games: EcosystemGame[]
  onGameClick?: (game: EcosystemGame) => void
  className?: string
}

interface GameElement {
  id: string | number
  game: EcosystemGame
  x: number
  y: number
  size: number
  type: 'seed' | 'sprout' | 'flower' | 'tree' | 'withered'
  color: string
  glowColor: string
}

const getGameElementType = (game: EcosystemGame): GameElement['type'] => {
  switch (game.status) {
    case 'unplayed': return 'seed'
    case 'playing': return 'sprout'
    case 'completed': return 'tree'
    case 'abandoned': return 'withered'
    case 'amnesty_granted': return 'withered'
    default: return 'seed'
  }
}

const getGameColors = (game: EcosystemGame) => {
  switch (game.status) {
    case 'unplayed': 
      return { color: '#4A4A4A', glowColor: '#8B4B5C' } // Dark gray seed
    case 'playing': 
      return { color: '#D4A574', glowColor: '#E6B887' } // Golden sprout
    case 'completed': 
      return { color: '#6B9B5A', glowColor: '#7FB068' } // Green tree
    case 'abandoned':
    case 'amnesty_granted': 
      return { color: '#7B8FA8', glowColor: '#8DA2BB' } // Blue-gray withered
    default: 
      return { color: '#4A4A4A', glowColor: '#8B4B5C' }
  }
}

const getGameSize = (game: EcosystemGame, type: GameElement['type']): number => {
  const baseSize = 8
  const playtimeHours = game.playtime_minutes / 60
  
  switch (type) {
    case 'seed': return baseSize + Math.min(playtimeHours * 0.1, 2) // Small dark seeds
    case 'sprout': return baseSize + Math.min(playtimeHours * 0.2, 4) // Growing sprouts
    case 'flower': return baseSize + Math.min(playtimeHours * 0.3, 6) // Medium flowers
    case 'tree': return baseSize + Math.min(playtimeHours * 0.4, 12) // Large trees
    case 'withered': return baseSize + Math.min(playtimeHours * 0.1, 3) // Small withered
    default: return baseSize
  }
}

// Deterministic positioning based on game ID for consistent layout
const getGamePosition = (gameId: string | number, index: number, total: number, containerSize: { width: number, height: number }) => {
  // Create pseudo-random but deterministic positioning
  const gameIdStr = String(gameId)
  const hash = gameIdStr.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const pseudoRandom1 = Math.abs(Math.sin(hash * 0.1))
  const pseudoRandom2 = Math.abs(Math.sin(hash * 0.2))
  
  // Use spiral pattern for better distribution
  const angle = (index / total) * Math.PI * 6 + pseudoRandom1 * Math.PI * 0.3
  const radius = Math.min(containerSize.width, containerSize.height) * 0.3 * Math.sqrt(index / total)
  
  const centerX = containerSize.width / 2
  const centerY = containerSize.height / 2
  
  const x = centerX + Math.cos(angle) * radius + (pseudoRandom1 - 0.5) * 40
  const y = centerY + Math.sin(angle) * radius + (pseudoRandom2 - 0.5) * 40
  
  return {
    x: Math.max(20, Math.min(containerSize.width - 20, x)),
    y: Math.max(20, Math.min(containerSize.height - 20, y))
  }
}

export function EcosystemMonument({ games, onGameClick, className = '' }: EcosystemMonumentProps) {
  const [hoveredGame, setHoveredGame] = useState<string | number | null>(null)
  const [containerSize] = useState({ width: 320, height: 320 })
  
  // Create game elements with consistent positioning
  const gameElements = useMemo(() => {
    return games.map((game, index) => {
      const type = getGameElementType(game)
      const colors = getGameColors(game)
      const size = getGameSize(game, type)
      const position = getGamePosition(game.id, index, games.length, containerSize)
      
      return {
        id: game.id,
        game,
        x: position.x,
        y: position.y,
        size,
        type,
        color: colors.color,
        glowColor: colors.glowColor
      }
    })
  }, [games, containerSize])

  // Calculate ecosystem health
  const ecosystemStats = useMemo(() => {
    const total = games.length
    const unplayed = games.filter(g => g.status === 'unplayed').length
    const playing = games.filter(g => g.status === 'playing').length
    const completed = games.filter(g => g.status === 'completed').length
    const amnesty = games.filter(g => g.status === 'amnesty_granted').length
    
    const healthScore = total > 0 ? ((completed + playing * 0.5) / total) * 100 : 0
    
    return { total, unplayed, playing, completed, amnesty, healthScore }
  }, [games])

  const formatPlaytime = (minutes: number) => {
    if (minutes === 0) return 'Never touched'
    if (minutes < 60) return `${minutes}m played`
    const hours = Math.floor(minutes / 60)
    return `${hours}h played`
  }

  const getEcosystemMessage = () => {
    const { healthScore, unplayed, completed } = ecosystemStats
    
    if (completed === 0 && unplayed > 10) {
      return "A barren wasteland of dormant promises..."
    } else if (healthScore < 20) {
      return "Seeds of potential lie scattered in the darkness"
    } else if (healthScore < 50) {
      return "Life begins to stir in the digital soil"
    } else if (healthScore < 80) {
      return "A flourishing garden of achievement emerges"
    } else {
      return "A magnificent ecosystem of mastered realms"
    }
  }

  const renderGameElement = (element: GameElement) => {
    const isHovered = hoveredGame === element.id
    const scale = isHovered ? 1.2 : 1
    
    switch (element.type) {
      case 'seed':
        return (
          <g key={element.id}>
            {/* Seed with subtle glow */}
            <circle
              cx={element.x}
              cy={element.y}
              r={element.size * scale}
              fill={element.color}
              opacity={0.8}
              style={{
                filter: isHovered ? `drop-shadow(0 0 8px ${element.glowColor})` : 'none',
                transition: 'all 0.3s ease'
              }}
            />
            {/* Inner detail */}
            <circle
              cx={element.x}
              cy={element.y}
              r={element.size * 0.4 * scale}
              fill="#2A2A2A"
              opacity={0.6}
            />
          </g>
        )
      
      case 'sprout':
        return (
          <g key={element.id}>
            {/* Sprout base */}
            <circle
              cx={element.x}
              cy={element.y + element.size * 0.3}
              r={element.size * 0.8 * scale}
              fill="#8B7355"
              opacity={0.9}
            />
            {/* Growing stem */}
            <rect
              x={element.x - 1 * scale}
              y={element.y - element.size * 0.5}
              width={2 * scale}
              height={element.size * scale}
              fill={element.color}
              rx={1}
              style={{
                filter: isHovered ? `drop-shadow(0 0 8px ${element.glowColor})` : 'none',
                transition: 'all 0.3s ease'
              }}
            />
            {/* Small leaves */}
            <ellipse
              cx={element.x - 3 * scale}
              cy={element.y - element.size * 0.2}
              rx={2 * scale}
              ry={4 * scale}
              fill={element.color}
              opacity={0.8}
            />
            <ellipse
              cx={element.x + 3 * scale}
              cy={element.y}
              rx={2 * scale}
              ry={4 * scale}
              fill={element.color}
              opacity={0.8}
            />
          </g>
        )
      
      case 'tree':
        return (
          <g key={element.id}>
            {/* Tree trunk */}
            <rect
              x={element.x - 2 * scale}
              y={element.y - element.size * 0.2}
              width={4 * scale}
              height={element.size * 0.8 * scale}
              fill="#8B7355"
              rx={2}
            />
            {/* Tree crown */}
            <circle
              cx={element.x}
              cy={element.y - element.size * 0.3}
              r={element.size * 0.8 * scale}
              fill={element.color}
              style={{
                filter: isHovered ? `drop-shadow(0 0 12px ${element.glowColor})` : `drop-shadow(0 0 4px ${element.glowColor})`,
                transition: 'all 0.3s ease'
              }}
            />
            {/* Highlight for completed games */}
            <circle
              cx={element.x - 2}
              cy={element.y - element.size * 0.5}
              r={2 * scale}
              fill="#FFEB3B"
              opacity={0.8}
              style={{ animation: 'twinkle 2s ease-in-out infinite alternate' }}
            />
          </g>
        )
      
      case 'withered':
        return (
          <g key={element.id}>
            {/* Withered remains */}
            <circle
              cx={element.x}
              cy={element.y}
              r={element.size * scale}
              fill={element.color}
              opacity={0.5}
              style={{
                filter: isHovered ? `drop-shadow(0 0 6px ${element.glowColor})` : 'none',
                transition: 'all 0.3s ease'
              }}
            />
            {/* Peaceful glow for amnesty */}
            {element.game.status === 'amnesty_granted' && (
              <circle
                cx={element.x}
                cy={element.y}
                r={element.size * 1.5 * scale}
                fill="none"
                stroke={element.glowColor}
                strokeWidth={1}
                opacity={0.3}
                style={{ animation: 'pulse 3s ease-in-out infinite' }}
              />
            )}
          </g>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Ecosystem Container */}
      <div 
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/5"
        style={{
          background: `
            radial-gradient(circle at 30% 70%, rgba(107, 155, 90, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(212, 165, 116, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, rgba(42, 36, 56, 0.3) 0%, rgba(15, 8, 22, 0.8) 100%)
          `
        }}
      >
        {/* SVG Ecosystem */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
          className="absolute inset-0"
        >
          {/* Background atmosphere */}
          <defs>
            <radialGradient id="ecosystemGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(107, 155, 90, 0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#ecosystemGlow)" />
          
          {/* Render game elements */}
          {gameElements.map(element => renderGameElement(element))}
          
          {/* Floating particles for atmosphere */}
          <g opacity="0.3">
            <circle cx="50" cy="80" r="1" fill="#C8A96E">
              <animate attributeName="cy" values="80;60;80" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="270" cy="200" r="0.5" fill="#7FB068">
              <animate attributeName="cy" values="200;180;200" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="50" r="1.5" fill="#8DA2BB">
              <animate attributeName="cy" values="50;30;50" dur="6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="6s" repeatCount="indefinite" />
            </circle>
          </g>
          
          {/* Interactive overlay for hover detection */}
          {gameElements.map(element => (
            <circle
              key={`hover-${element.id}`}
              cx={element.x}
              cy={element.y}
              r={Math.max(element.size + 5, 15)}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredGame(element.id)}
              onMouseLeave={() => setHoveredGame(null)}
              onClick={() => onGameClick?.(element.game)}
            />
          ))}
        </svg>
        
        {/* Hover Tooltip */}
        {hoveredGame && (
          <div className="absolute bottom-4 left-4 right-4">
            {(() => {
              const element = gameElements.find(e => e.id === hoveredGame)
              if (!element) return null
              
              return (
                <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-sm">
                  <div className="font-semibold text-white mb-1" style={{ fontFamily: 'Crimson Text, serif' }}>
                    {element.game.name}
                  </div>
                  <div className="text-gray-300 text-xs">
                    {formatPlaytime(element.game.playtime_minutes)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize mt-1">
                    {element.game.status.replace('_', ' ')}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
      
      {/* Ecosystem Health Display */}
      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-gray-300 mb-1" style={{ fontFamily: 'Crimson Text, serif' }}>
          Ecosystem Health: {Math.round(ecosystemStats.healthScore)}%
        </div>
        <div className="text-xs text-gray-500 italic leading-relaxed">
          {getEcosystemMessage()}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="text-gray-500">🌱 {ecosystemStats.playing} growing</span>
          <span className="text-green-400">🌳 {ecosystemStats.completed} flourishing</span>
          <span className="text-gray-600">💀 {ecosystemStats.unplayed} dormant</span>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}