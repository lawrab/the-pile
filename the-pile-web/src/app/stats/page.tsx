'use client'

import { useQuery } from '@tanstack/react-query'
import { pileApi, statsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, Trophy, Clock, DollarSign, Calendar, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, calculateShameLevel } from '@/lib/utils'

export default function StatsPage() {
  const { user } = useAuth()

  const { data: pile } = useQuery({
    queryKey: ['pile'],
    queryFn: async () => {
      const response = await pileApi.getPile()
      return response.data
    },
    enabled: !!user,
  })

  const { data: realityCheck } = useQuery({
    queryKey: ['reality-check'],
    queryFn: async () => {
      const response = await statsApi.getRealityCheck()
      return response.data
    },
    enabled: !!user,
  })

  const { data: shameScore } = useQuery({
    queryKey: ['shame-score'],
    queryFn: async () => {
      const response = await statsApi.getShameScore()
      return response.data
    },
    enabled: !!user,
  })

  const { data: insights } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const response = await statsApi.getInsights()
      return response.data
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your stats</h1>
          <Link href="/auth/steam">
            <Button>Login with Steam</Button>
          </Link>
        </div>
      </div>
    )
  }

  const shameLevel = shameScore ? calculateShameLevel(shameScore.score) : null
  
  // Calculate additional stats from pile data
  const stats = pile ? {
    totalGames: pile.length,
    unplayedGames: pile.filter(entry => entry.status === 'unplayed').length,
    playingGames: pile.filter(entry => entry.status === 'playing').length,
    completedGames: pile.filter(entry => entry.status === 'completed').length,
    abandonedGames: pile.filter(entry => entry.status === 'abandoned').length,
    amnestyGames: pile.filter(entry => entry.status === 'amnesty_granted').length,
    neverTouchedGames: pile.filter(entry => entry.playtime_minutes === 0).length,
    totalPlaytime: pile.reduce((sum, entry) => sum + (entry.playtime_minutes || 0), 0),
  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 Reality Check</h1>
          <p className="text-slate-400">
            The brutal truth about your gaming habits
          </p>
        </div>

        {/* Shame Score Highlight */}
        {shameScore && (
          <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Shame Score</h2>
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {shameScore.score.toFixed(0)}
                  </div>
                  {shameLevel && (
                    <div className={`text-lg font-semibold ${shameLevel.color}`}>
                      {shameLevel.level}
                    </div>
                  )}
                </div>
                <Trophy className="h-16 w-16 text-red-400" />
              </div>
              <p className="text-slate-300 mt-4">
                {shameLevel?.description || "Your pile has achieved concerning levels of structural integrity."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Core Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-semibold">Total Games</h3>
              </div>
              <div className="text-2xl font-bold">
                {stats?.totalGames || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-semibold">Unplayed</h3>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {stats?.unplayedGames || 0}
              </div>
              <div className="text-sm text-slate-400">
                {stats ? Math.round((stats.unplayedGames / stats.totalGames) * 100) : 0}% of library
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h3 className="text-base font-semibold">Money Wasted</h3>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {realityCheck ? formatCurrency(realityCheck.money_wasted) : '$0'}
              </div>
              <div className="text-sm text-slate-400">
                on unplayed games
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h3 className="text-base font-semibold">Completion Time</h3>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {realityCheck?.completion_years.toFixed(1) || '∞'}
              </div>
              <div className="text-sm text-slate-400">
                years at current pace
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Game Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Game Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Unplayed
                </span>
                <span className="font-semibold">{stats?.unplayedGames || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  Currently Playing
                </span>
                <span className="font-semibold">{stats?.playingGames || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Completed
                </span>
                <span className="font-semibold">{stats?.completedGames || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  Abandoned
                </span>
                <span className="font-semibold">{stats?.abandonedGames || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  Amnesty Granted
                </span>
                <span className="font-semibold">{stats?.amnestyGames || 0}</span>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Harsh Truths */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Harsh Truths</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-900/20 rounded border border-red-500/20">
                <div className="font-semibold text-red-400">Never Touched</div>
                <div className="text-2xl font-bold">{stats?.neverTouchedGames || 0}</div>
                <div className="text-sm text-slate-400">
                  games with 0 minutes played
                </div>
              </div>
              
              <div className="p-3 bg-yellow-900/20 rounded border border-yellow-500/20">
                <div className="font-semibold text-yellow-400">Total Playtime</div>
                <div className="text-2xl font-bold">
                  {stats ? Math.round(stats.totalPlaytime / 60) : 0}h
                </div>
                <div className="text-sm text-slate-400">
                  across all games
                </div>
              </div>

              <div className="p-3 bg-blue-900/20 rounded border border-blue-500/20">
                <div className="font-semibold text-blue-400">Completion Rate</div>
                <div className="text-2xl font-bold">
                  {stats && stats.totalGames > 0 
                    ? Math.round((stats.completedGames / stats.totalGames) * 100)
                    : 0
                  }%
                </div>
                <div className="text-sm text-slate-400">
                  of games actually finished
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        {insights && insights.recommendations && insights.recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">🔍 Behavioral Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-slate-700 rounded">
                    <div className="text-base text-slate-300">{recommendation}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Ready to Take Action?</h3>
              <p className="text-slate-400 mb-4">
                Your pile won&apos;t shrink itself. Time to either play those games or grant them amnesty.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/pile">
                  <Button>Return to Pile</Button>
                </Link>
                <Link href="/cemetery">
                  <Button variant="outline">Visit Cemetery</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}