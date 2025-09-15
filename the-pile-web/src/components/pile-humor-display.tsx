'use client'

import { useEffect, useState } from 'react'
import { PILE_MESSAGES, AMNESTY_REASONS, BEHAVIORAL_INSIGHTS, getRandomItem, formatInsight } from '@/lib/humor-constants'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

interface PileHumorDisplayProps {
  unplayedCount?: number
  shameScore?: number
  showAmnestyReasons?: boolean
  showBehavioralInsights?: boolean
}

export function PileHumorDisplay({ 
  unplayedCount = 0, 
  shameScore = 0,
  showAmnestyReasons = false,
  showBehavioralInsights = false 
}: PileHumorDisplayProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentAmnesty, setCurrentAmnesty] = useState('')
  const [currentInsight, setCurrentInsight] = useState('')

  // Get pile category based on counts
  const getPileCategory = (): keyof typeof PILE_MESSAGES => {
    if (unplayedCount === 0) return 'empty'
    if (unplayedCount < 10) return 'small'
    if (unplayedCount < 50) return 'medium'
    if (unplayedCount < 100) return 'large'
    return 'massive'
  }

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
  }, [unplayedCount, shameScore, showAmnestyReasons, showBehavioralInsights])

  const refreshMessages = () => {
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
  }

  return (
    <div className="space-y-4">
      {/* Main pile message */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-400 mb-1">Pile Status</p>
            <p className="text-slate-200 italic">{currentMessage}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshMessages}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Amnesty reason suggestion */}
      {showAmnestyReasons && currentAmnesty && (
        <div className="bg-purple-900/20 backdrop-blur-sm rounded-lg p-4 border border-purple-700/30">
          <p className="text-sm text-purple-400 mb-1">Suggested Amnesty Reason</p>
          <p className="text-purple-200 italic">&quot;{currentAmnesty}&quot;</p>
        </div>
      )}

      {/* Behavioral insight */}
      {showBehavioralInsights && currentInsight && (
        <div className="bg-orange-900/20 backdrop-blur-sm rounded-lg p-4 border border-orange-700/30">
          <p className="text-sm text-orange-400 mb-1">Pattern Detected</p>
          <p className="text-orange-200">{currentInsight}</p>
        </div>
      )}
    </div>
  )
}