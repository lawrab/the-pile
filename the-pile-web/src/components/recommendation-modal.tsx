'use client'

import { useEffect } from 'react'
import { PileEntry } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ThumbsUp,
  Clock,
  DollarSign,
  Calendar,
  Play,
  Heart,
  X,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  AlertTriangle
} from 'lucide-react'
import Image from 'next/image'

interface GameRecommendation {
  game: PileEntry
  reason: string
  confidence: 'high' | 'medium' | 'low'
  category: 'quick-win' | 'redemption-arc' | 'hidden-gem' | 'mercy-kill' | 'default'
}

interface RecommendationModalProps {
  isOpen: boolean
  onClose: () => void
  recommendation: GameRecommendation | null
  onStartPlaying: (gameId: number) => void
  onGrantAmnesty: (gameId: number) => void
}

export function RecommendationModal({
  isOpen,
  onClose,
  recommendation,
  onStartPlaying,
  onGrantAmnesty
}: RecommendationModalProps) {
  // Handle escape key
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

  if (!isOpen || !recommendation) return null

  const { game, reason, confidence, category } = recommendation

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'quick-win':
        return {
          icon: Target,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          title: 'Quick Win',
          description: 'Short games you can actually finish'
        }
      case 'redemption-arc':
        return {
          icon: TrendingUp,
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          title: 'Redemption Arc',
          description: 'Games worth giving another chance'
        }
      case 'hidden-gem':
        return {
          icon: Sparkles,
          color: 'text-amber-400',
          bg: 'bg-amber-500/20',
          title: 'Hidden Gem',
          description: 'Highly-rated games waiting to be discovered'
        }
      case 'mercy-kill':
        return {
          icon: AlertTriangle,
          color: 'text-purple-400',
          bg: 'bg-purple-500/20',
          title: 'Mercy Kill',
          description: 'Consider letting these go with amnesty'
        }
      default:
        return {
          icon: Award,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          title: 'Recommended',
          description: 'Worth considering for your next play'
        }
    }
  }

  const getConfidenceInfo = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          text: 'Strong Pick'
        }
      case 'medium':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          text: 'Good Bet'
        }
      default:
        return {
          color: 'text-slate-400',
          bg: 'bg-slate-500/20',
          text: 'Worth a Shot'
        }
    }
  }

  const categoryInfo = getCategoryInfo(category)
  const confidenceInfo = getConfidenceInfo(confidence)
  const CategoryIcon = categoryInfo.icon

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
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

        <CardHeader>
          <div className="flex items-start gap-4 pr-12">
            {game.steam_game.image_url && (
              <Image 
                src={game.steam_game.image_url}
                alt={game.steam_game.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-xl font-bold mb-2">
                {game.steam_game.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${categoryInfo.bg}`}>
                  <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                  <span className={`text-sm font-medium ${categoryInfo.color}`}>
                    {categoryInfo.title}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${confidenceInfo.bg} ${confidenceInfo.color}`}>
                  {confidenceInfo.text}
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                {categoryInfo.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Recommendation Reasoning */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Why This Recommendation
            </h3>
            <p className="text-slate-300">{reason}</p>
          </div>

          {/* Steam Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide">Game Info</h3>
              
              {game.steam_game.steam_rating_percent && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-slate-400" />
                  <span>{game.steam_game.steam_rating_percent}%</span>
                  {game.steam_game.steam_review_summary && (
                    <span className="text-sm text-slate-500">
                      ({game.steam_game.steam_review_summary})
                    </span>
                  )}
                </div>
              )}

              {game.steam_game.steam_review_count && (
                <div className="text-sm text-slate-400">
                  Based on {game.steam_game.steam_review_count.toLocaleString()} reviews
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Played: {formatPlaytime(game.playtime_minutes || 0)}</span>
              </div>

              {game.purchase_price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span>Paid: {formatCurrency(game.purchase_price)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Purchased: {formatDate(game.purchase_date || null)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide">Details</h3>
              
              {game.steam_game.genres && game.steam_game.genres.length > 0 && (
                <div>
                  <div className="text-sm text-slate-500 mb-1">Genres</div>
                  <div className="flex flex-wrap gap-1">
                    {game.steam_game.genres.slice(0, 4).map((genre, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {game.steam_game.developer && (
                <div>
                  <div className="text-sm text-slate-500">Developer</div>
                  <div className="text-sm">{game.steam_game.developer}</div>
                </div>
              )}

              {game.steam_game.release_date && (
                <div>
                  <div className="text-sm text-slate-500">Released</div>
                  <div className="text-sm">{game.steam_game.release_date}</div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {game.steam_game.description && (
            <div className="bg-slate-800/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm text-slate-400 uppercase tracking-wide">Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {game.steam_game.description}
              </p>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Maybe Later
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                onGrantAmnesty(game.id)
                onClose()
              }}
              className="flex-1 border-purple-500/50 hover:bg-purple-500/10"
            >
              <Heart className="h-4 w-4 mr-2" />
              Grant Amnesty
            </Button>
            
            <Button
              onClick={() => {
                onStartPlaying(game.id)
                onClose()
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Playing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}