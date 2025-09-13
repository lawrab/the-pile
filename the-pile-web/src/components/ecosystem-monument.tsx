'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip } from './ui/tooltip'
import { Download, Share2 } from 'lucide-react'
import { Button } from './ui/button'

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
  activeFilter?: string | null
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

const getGameSize = (game: EcosystemGame, type: GameElement['type'], totalGames: number): number => {
  // Adaptive base size depending on collection size
  const baseSize = totalGames <= 10 ? 10 : totalGames <= 50 ? 8 : totalGames <= 100 ? 6 : 5
  const playtimeHours = game.playtime_minutes / 60
  
  // Size scaling factor for large collections
  const sizeFactor = totalGames > 100 ? 0.8 : 1
  
  switch (type) {
    case 'seed': return (baseSize + Math.min(playtimeHours * 0.1, 2)) * sizeFactor // Small dark seeds
    case 'sprout': return (baseSize + Math.min(playtimeHours * 0.2, 4)) * sizeFactor // Growing sprouts
    case 'flower': return (baseSize + Math.min(playtimeHours * 0.3, 6)) * sizeFactor // Medium flowers
    case 'tree': return (baseSize + Math.min(playtimeHours * 0.4, 12)) * sizeFactor // Large trees
    case 'withered': return (baseSize + Math.min(playtimeHours * 0.1, 3)) * sizeFactor // Small withered
    default: return baseSize * sizeFactor
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
  
  // Use spiral pattern for better distribution, adaptive to collection size
  const spiralTurns = total <= 10 ? 3 : total <= 50 ? 4 : 6
  const angle = (index / total) * Math.PI * spiralTurns + pseudoRandom1 * Math.PI * 0.3
  const maxRadius = Math.min(containerSize.width, containerSize.height) * 0.35
  const radius = maxRadius * Math.sqrt(index / total)
  
  const centerX = containerSize.width / 2
  const centerY = containerSize.height / 2
  
  // Reduce random jitter for large collections to prevent overlap
  const jitter = total <= 20 ? 40 : total <= 100 ? 25 : 15
  const x = centerX + Math.cos(angle) * radius + (pseudoRandom1 - 0.5) * jitter
  const y = centerY + Math.sin(angle) * radius + (pseudoRandom2 - 0.5) * jitter
  
  return {
    x: Math.max(20, Math.min(containerSize.width - 20, x)),
    y: Math.max(20, Math.min(containerSize.height - 20, y))
  }
}

export function EcosystemMonument({ games, onGameClick, className = '', activeFilter }: EcosystemMonumentProps) {
  const [hoveredGame, setHoveredGame] = useState<string | number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Export functions
  const exportAsImage = () => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = containerSize.width * 2 // High DPI
    canvas.height = containerSize.height * 2
    
    img.onload = () => {
      if (ctx) {
        ctx.scale(2, 2) // High DPI scaling
        ctx.drawImage(img, 0, 0)
        
        // Create download link
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `ecosystem-${new Date().toISOString().split('T')[0]}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
        })
      }
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const exportAsData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      ecosystem: {
        totalGames: games.length,
        healthScore: ecosystemStats.healthScore,
        breakdown: {
          unplayed: ecosystemStats.unplayed,
          playing: ecosystemStats.playing,
          completed: ecosystemStats.completed,
          amnesty: ecosystemStats.amnesty
        }
      },
      games: gameElements.map(element => ({
        name: element.game.name,
        status: element.game.status,
        playtime_minutes: element.game.playtime_minutes,
        type: element.type,
        position: { x: element.x, y: element.y }
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecosystem-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareEcosystem = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Gaming Ecosystem',
          text: `🌱 My digital ecosystem: ${ecosystemStats.completed} completed, ${ecosystemStats.playing} in progress, ${ecosystemStats.unplayed} awaiting. Health: ${Math.round(ecosystemStats.healthScore)}%`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      const text = `🌱 My digital ecosystem: ${ecosystemStats.completed} completed, ${ecosystemStats.playing} in progress, ${ecosystemStats.unplayed} awaiting. Health: ${Math.round(ecosystemStats.healthScore)}%`
      await navigator.clipboard.writeText(text)
      console.log('✅ Ecosystem stats copied to clipboard!')
    }
  }

  // Handle empty state
  if (!games || games.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-square max-w-[200px] mx-auto relative overflow-hidden rounded-xl bg-gray-900/50 border border-gray-700/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🌱</div>
              <div className="text-sm text-gray-400">
                {activeFilter ? `No ${activeFilter} games` : 'Empty Garden'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {activeFilter ? 'Try a different filter or clear the current one' : 'Import games to grow your ecosystem'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Adaptive container sizing based on pile size
  const containerSize = useMemo(() => {
    const gameCount = games.length
    if (gameCount <= 10) return { width: 280, height: 280 }
    if (gameCount <= 50) return { width: 320, height: 320 }
    if (gameCount <= 100) return { width: 400, height: 400 }
    return { width: 450, height: 450 } // Large collections
  }, [games.length])
  
  // Create game elements with consistent positioning and performance optimization
  const gameElements = useMemo(() => {
    // Apply active filter first
    let filteredGames = games
    if (activeFilter) {
      // Map filter strings to status values  
      const statusMap: { [key: string]: string } = {
        'unplayed': 'unplayed',
        'playing': 'playing', 
        'completed': 'completed',
        'amnesty_granted': 'amnesty_granted',
        'amnesty': 'amnesty_granted' // Handle both variations
      }
      const targetStatus = statusMap[activeFilter]
      if (targetStatus) {
        filteredGames = games.filter(game => game.status === targetStatus)
      }
    }
    
    // For very large collections, implement level of detail (LOD)
    const shouldOptimize = filteredGames.length > 200
    const processedGames = shouldOptimize ? filteredGames.filter((_, index) => index % 2 === 0 || filteredGames[index].status !== 'unplayed') : filteredGames
    
    return processedGames.map((game, index) => {
      const type = getGameElementType(game)
      const colors = getGameColors(game)
      const size = getGameSize(game, type, games.length)
      const position = getGamePosition(game.id, index, processedGames.length, containerSize)
      
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
  }, [games, containerSize, activeFilter])

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

  // Animation wrapper for smooth transitions
  const AnimatedGameElement = ({ element, children }: { element: GameElement; children: React.ReactNode }) => (
    <motion.g 
      key={element.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.5 
      }}
      style={{ 
        transformOrigin: `${element.x}px ${element.y}px`,
        transformBox: 'fill-box'
      }}
    >
      {children}
    </motion.g>
  )

  const renderGameElement = (element: GameElement) => {
    const isHovered = hoveredGame === element.id
    const isFiltered = activeFilter && element.game.status === activeFilter
    const scale = isHovered ? 1.2 : isFiltered ? 1.1 : 1
    
    switch (element.type) {
      case 'seed':
        return (
          <AnimatedGameElement element={element}>
            {/* Seed with subtle glow */}
            <motion.circle
              cx={element.x}
              cy={element.y}
              r={element.size}
              fill={element.color}
              opacity={0.8}
              animate={{
                r: element.size * scale,
                filter: isHovered ? `drop-shadow(0 0 8px ${element.glowColor})` : 'none'
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            {/* Inner detail */}
            <motion.circle
              cx={element.x}
              cy={element.y}
              r={element.size * 0.4}
              fill="#2A2A2A"
              opacity={0.6}
              animate={{
                r: element.size * 0.4 * scale
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </AnimatedGameElement>
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
          ref={svgRef}
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
          
          {/* Render game elements with smooth transitions */}
          <AnimatePresence mode="popLayout">
            {gameElements.map(element => renderGameElement(element))}
          </AnimatePresence>
          
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
                <div className="bg-black/80 backdrop-blur-fix border border-white/10 rounded-lg p-3 text-sm">
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

      {/* Export Controls */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Tooltip content="Download as PNG image">
          <Button
            size="sm"
            variant="ghost"
            onClick={exportAsImage}
            className="text-xs"
          >
            <Download size={14} className="mr-1" />
            Image
          </Button>
        </Tooltip>
        
        <Tooltip content="Export ecosystem data">
          <Button
            size="sm"
            variant="ghost"
            onClick={exportAsData}
            className="text-xs"
          >
            📊 Data
          </Button>
        </Tooltip>
        
        <Tooltip content="Share ecosystem stats">
          <Button
            size="sm"
            variant="ghost"
            onClick={shareEcosystem}
            className="text-xs"
          >
            <Share2 size={14} className="mr-1" />
            Share
          </Button>
        </Tooltip>
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