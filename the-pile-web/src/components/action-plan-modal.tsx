'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Target, Trophy, Sparkles, Zap, Flame, ThumbsUp } from 'lucide-react'
import { ActionPlan } from '@/lib/personality-service'
import Image from 'next/image'

interface ActionPlanModalProps {
  isOpen: boolean
  onClose: () => void
  actionPlan: ActionPlan | null
  onStartPlaying: (gameId: number) => void
  onGrantAmnesty: (gameId: number) => void
}

export function ActionPlanModal({ 
  isOpen, 
  onClose, 
  actionPlan,
  onStartPlaying,
  onGrantAmnesty 
}: ActionPlanModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !actionPlan) return null

  const getIcon = () => {
    switch (actionPlan.type) {
      case 'play': return <Zap className="h-5 w-5 text-yellow-500" />
      case 'complete': return <Trophy className="h-5 w-5 text-green-500" />
      case 'amnesty': return <Sparkles className="h-5 w-5 text-purple-500" />
      case 'streak': return <Flame className="h-5 w-5 text-orange-500" />
      default: return <Target className="h-5 w-5 text-blue-500" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'hard': return 'bg-red-500/20 text-red-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  const formatPlaytime = (minutes: number) => {
    if (minutes === 0) return 'Never played'
    if (minutes < 60) return `${minutes}m`
    return `${Math.round(minutes / 60)}h`
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] my-8 bg-slate-900 border-slate-700 flex flex-col">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 pr-8">
            {getIcon()}
            <div>
              <CardTitle className="text-xl">{actionPlan.title}</CardTitle>
              <p className="text-slate-400 mt-1">{actionPlan.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(actionPlan.difficulty)}`}>
              {actionPlan.difficulty}
            </span>
            <span className="text-sm px-3 py-1 rounded-full font-medium bg-slate-700 text-slate-300">
              +{actionPlan.points} pts
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                {actionPlan.type === 'amnesty' ? 'Candidates for Amnesty' : 'Target Games'}
              </h3>
              
              {actionPlan.targetGames && actionPlan.targetGames.length > 0 ? (
                <div className="space-y-3">
                  {actionPlan.targetGames.map((game, index) => (
                    <div
                      key={game.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      {game.steam_game?.image_url && (
                        <Image 
                          src={game.steam_game.image_url} 
                          alt={game.steam_game.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{game.steam_game?.name || 'Unknown Game'}</h4>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-slate-400">
                            Playtime: {formatPlaytime(game.playtime_minutes)}
                          </span>
                          
                          {game.purchase_price && (
                            <span className="text-sm text-slate-400">
                              ${game.purchase_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {/* Steam Rating */}
                        {game.steam_game?.steam_rating_percent && (
                          <div className="flex items-center gap-1 mt-1">
                            <ThumbsUp className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-400">
                              {game.steam_game.steam_rating_percent}%
                              {game.steam_game.steam_review_summary && (
                                <span className="ml-1">({game.steam_game.steam_review_summary})</span>
                              )}
                            </span>
                          </div>
                        )}
                        
                        {/* Genres */}
                        {game.steam_game?.genres && game.steam_game.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {game.steam_game.genres.slice(0, 3).map((genre) => (
                              <span 
                                key={genre} 
                                className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {actionPlan.type === 'amnesty' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                            onClick={() => {
                              onGrantAmnesty(game.steam_game?.id || game.id)
                              onClose()
                            }}
                          >
                            Grant Amnesty
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline" 
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                            onClick={() => {
                              onStartPlaying(game.steam_game?.id || game.id)
                              onClose()
                            }}
                          >
                            Start Playing
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No target games available for this plan.</p>
                  <p className="text-sm mt-1">Try syncing your Steam data or adjusting your pile.</p>
                </div>
              )}
            </div>
            
            {/* Tips based on plan type */}
            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <h4 className="font-medium text-slate-300 mb-2">💡 Pro Tips</h4>
              {actionPlan.type === 'play' && (
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Set a 30-minute timer - small wins build momentum</li>
                  <li>• Pick the game that looks most appealing right now</li>
                  <li>• Don&apos;t pressure yourself to finish - just start!</li>
                </ul>
              )}
              {actionPlan.type === 'complete' && (
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Focus on games with shorter completion times</li>
                  <li>• Check HowLongToBeat.com for time estimates</li>
                  <li>• Weekend sessions work great for indie games</li>
                </ul>
              )}
              {actionPlan.type === 'amnesty' && (
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Be honest about what you&apos;ll realistically play</li>
                  <li>• Consider games you bought impulsively</li>
                  <li>• It&apos;s okay to let go - your pile will thank you</li>
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}