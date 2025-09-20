'use client'

import { useEffect, useState, useCallback } from 'react'
import { PILE_MESSAGES, AMNESTY_REASONS, BEHAVIORAL_INSIGHTS, getRandomItem, formatInsight } from '@/lib/humor-constants'
import { RefreshCw, Sparkles, Brain, Heart } from 'lucide-react'

interface PileHumorDisplayProps {
  unplayedCount?: number
  shameScore?: number
  showAmnestyReasons?: boolean
  showBehavioralInsights?: boolean
  variant?: 'compact' | 'full'
}

export function PileHumorDisplay({ 
  unplayedCount = 0, 
  shameScore = 0,
  showAmnestyReasons = false,
  showBehavioralInsights = false,
  variant = 'compact'
}: PileHumorDisplayProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentAmnesty, setCurrentAmnesty] = useState('')
  const [currentInsight, setCurrentInsight] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)

  // Get pile category based on counts
  const getPileCategory = useCallback((): keyof typeof PILE_MESSAGES => {
    if (unplayedCount === 0) return 'empty'
    if (unplayedCount < 10) return 'small'
    if (unplayedCount < 50) return 'medium'
    if (unplayedCount < 100) return 'large'
    return 'massive'
  }, [unplayedCount])

  // Initialize messages
  useEffect(() => {
    const category = getPileCategory()
    setCurrentMessage(getRandomItem(PILE_MESSAGES[category]))
    
    if (showAmnestyReasons) {
      setCurrentAmnesty(getRandomItem(AMNESTY_REASONS))
    }
    
    if (showBehavioralInsights) {
      const insightType = getRandomItem(Object.keys(BEHAVIORAL_INSIGHTS) as Array<keyof typeof BEHAVIORAL_INSIGHTS>)
      const template = getRandomItem(BEHAVIORAL_INSIGHTS[insightType])
      
      // Example variables - in real app these would come from actual data
      const variables = {
        percentage: Math.floor(Math.random() * 30 + 60),
        genre: 'RPG',
        rate: Math.floor(Math.random() * 20 + 5),
        count: Math.floor(Math.random() * 20 + 10),
        finished: Math.floor(Math.random() * 5),
        years: Math.floor(Math.random() * 3 + 1)
      }
      
      setCurrentInsight(formatInsight(template, variables))
    }
  }, [unplayedCount, shameScore, showAmnestyReasons, showBehavioralInsights, getPileCategory])

  const refreshMessages = () => {
    const category = getPileCategory()
    const messages = PILE_MESSAGES[category]
    
    // Cycle through messages instead of random
    const nextIndex = (messageIndex + 1) % messages.length
    setMessageIndex(nextIndex)
    setCurrentMessage(messages[nextIndex])
    
    if (showAmnestyReasons) {
      setCurrentAmnesty(getRandomItem(AMNESTY_REASONS))
    }
    
    if (showBehavioralInsights) {
      const insightType = getRandomItem(Object.keys(BEHAVIORAL_INSIGHTS) as Array<keyof typeof BEHAVIORAL_INSIGHTS>)
      const template = getRandomItem(BEHAVIORAL_INSIGHTS[insightType])
      
      const variables = {
        percentage: Math.floor(Math.random() * 30 + 60),
        genre: 'RPG',
        rate: Math.floor(Math.random() * 20 + 5),
        count: Math.floor(Math.random() * 20 + 10),
        finished: Math.floor(Math.random() * 5),
        years: Math.floor(Math.random() * 3 + 1)
      }
      
      setCurrentInsight(formatInsight(template, variables))
    }
  }

  if (variant === 'compact') {
    return (
      <div className="relative group">
        {/* Single line humor display */}
        <div className="flex items-center justify-between gap-4 px-4 py-2 bg-gradient-to-r from-slate-800/30 to-slate-700/30 backdrop-blur-sm rounded-full border border-slate-700/30 transition-all hover:border-slate-600/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-slate-300 italic truncate">{currentMessage}</p>
          </div>
          <button
            onClick={refreshMessages}
            className="p-1 rounded-full hover:bg-slate-700/50 transition-colors flex-shrink-0"
            aria-label="Next message"
          >
            <RefreshCw className="h-3 w-3 text-slate-400 hover:text-slate-300" />
          </button>
        </div>

        {/* Tooltip with full message on hover */}
        {currentMessage.length > 50 && (
          <div className="absolute left-0 right-0 top-full mt-2 p-3 bg-slate-800 rounded-lg border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <p className="text-sm text-slate-300">{currentMessage}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {/* Main pile message - redesigned */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="relative p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today&apos;s Wisdom</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{currentMessage}</p>
            </div>
            <button
              onClick={refreshMessages}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
              aria-label="Refresh message"
            >
              <RefreshCw className="h-4 w-4 text-slate-400 hover:text-slate-300 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Behavioral insight - redesigned */}
      {showBehavioralInsights && currentInsight && (
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl border border-orange-500/20">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-300 mb-1">Pattern Analysis</p>
                <p className="text-sm text-orange-100/90 leading-relaxed">{currentInsight}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amnesty reason - redesigned */}
      {showAmnestyReasons && currentAmnesty && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-300 mb-1">Amnesty Inspiration</p>
                <p className="text-sm text-purple-100/90 italic">&quot;{currentAmnesty}&quot;</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}