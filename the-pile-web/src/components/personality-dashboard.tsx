'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PersonalityService } from '@/lib/personality-service'
import { PileEntry, GameStatus } from '@/types'
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  Zap,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Trophy,
  Flame,
  ThumbsUp
} from 'lucide-react'
import Link from 'next/link'

interface PersonalityDashboardProps {
  pile: PileEntry[]
  userName?: string
  shameScore: number
}

export function PersonalityDashboard({ pile, userName, shameScore }: PersonalityDashboardProps) {
  const [greeting, setGreeting] = useState(PersonalityService.getGreeting(pile, userName))
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  
  const recommendations = PersonalityService.getRecommendations(pile)
  const actionPlans = PersonalityService.getActionPlan(pile)
  const insights = PersonalityService.getPileAnalysis(pile)

  // Rotate through different greetings periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(PersonalityService.getGreeting(pile, userName))
    }, 30000) // Change every 30 seconds

    return () => clearInterval(interval)
  }, [pile, userName])

  // Cycle through insights
  useEffect(() => {
    if (insights.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % insights.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [insights])

  return (
    <div className="space-y-6">
      {/* Dynamic Greeting Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-3 flex items-center gap-3 leading-tight">
                <span className="text-4xl">{greeting.emoji}</span>
                <span>{greeting.greeting}</span>
              </h2>
              {greeting.subtext && (
                <p className="text-slate-300 text-lg">{greeting.subtext}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-red-400 mb-1">
                {shameScore.toFixed(0)}
              </div>
              <div className="text-base text-slate-400 font-medium">Pile Score</div>
            </div>
          </div>
          
          {/* Rolling insights */}
          {insights.length > 0 && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-base text-slate-300 animate-fade-in">
                  {insights[currentMessageIndex]}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Plans - Your Redemption Arc */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-blue-400" />
            Your Redemption Arc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {actionPlans.slice(0, 3).map((plan, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {plan.type === 'play' && <Zap className="h-4 w-4 text-yellow-500" />}
                    {plan.type === 'complete' && <Trophy className="h-4 w-4 text-green-500" />}
                    {plan.type === 'amnesty' && <Sparkles className="h-4 w-4 text-purple-500" />}
                    {plan.type === 'streak' && <Flame className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{plan.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                        plan.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        plan.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {plan.difficulty}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">+{plan.points} pts</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations - What to Play Next */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-green-400" />
            What to Play Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.slice(0, 4).map((rec, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-green-500/50 transition-all"
              >
                {rec.game.steam_game?.image_url && (
                  <img 
                    src={rec.game.steam_game.image_url} 
                    alt={rec.game.steam_game.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{rec.game.steam_game?.name}</h4>
                  <p className="text-sm text-slate-400 mt-1">{rec.reason}</p>
                  
                  {/* Steam Rating */}
                  {rec.game.steam_game?.steam_rating_percent && (
                    <div className="flex items-center gap-1 mt-1">
                      <ThumbsUp className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-400">
                        {rec.game.steam_game.steam_rating_percent}%
                        {rec.game.steam_game.steam_review_summary && (
                          <span className="ml-1">({rec.game.steam_game.steam_review_summary})</span>
                        )}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      rec.category === 'quick-win' ? 'bg-green-500/20 text-green-400' :
                      rec.category === 'redemption-arc' ? 'bg-blue-500/20 text-blue-400' :
                      rec.category === 'hidden-gem' ? 'bg-amber-500/20 text-amber-400' :
                      rec.category === 'mercy-kill' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {rec.category.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                      rec.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {rec.confidence === 'high' ? 'Strong Pick' : 
                       rec.confidence === 'medium' ? 'Good Bet' : 'Worth a Shot'}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {recommendations.length === 0 && (
            <p className="text-center text-slate-500 py-4">
              No recommendations yet. Import your library first!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats with Personality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">Pile Status</p>
                <p className="text-3xl font-bold mt-2">
                  {pile.filter(e => e.status === GameStatus.UNPLAYED).length}
                </p>
                <p className="text-sm text-slate-400 mt-1">games judging you</p>
              </div>
              <Award className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">Time Debt</p>
                <p className="text-3xl font-bold mt-2">
                  {Math.round(pile.filter(e => e.status === GameStatus.UNPLAYED).length * 20 / 24)}
                </p>
                <p className="text-sm text-slate-400 mt-1">days to clear</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">Completion</p>
                <p className="text-3xl font-bold mt-2">
                  {pile.length > 0 
                    ? Math.round((pile.filter(e => e.status === GameStatus.COMPLETED).length / pile.length) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-slate-400 mt-1">finished games</p>
              </div>
              <Trophy className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}