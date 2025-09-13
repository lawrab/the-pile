'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pileApi, statsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-provider'
import { PileVisualization } from '@/components/pile-visualization'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateShameLevel } from '@/lib/utils'
import { Download, Zap, Trophy, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { usePile } from '@/lib/hooks'
import { ImportLibraryButton } from '@/components/import-library-button'

export default function PilePage() {
  const { user } = useAuth()
  const { data: pile, isLoading } = usePile(!!user)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your pile</h1>
          <Link href="/auth/steam">
            <Button>Login with Steam</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Loading your pile...</h1>
        </div>
      </div>
    )
  }

  if (!pile || pile.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">📚 Your Pile is Empty</h1>
          <p className="text-slate-400 mb-6">
            Import your Steam library to start tracking your games!
          </p>
          <ImportLibraryButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📚 Your Pile of Shame</h1>
            <p className="text-slate-400">
              {pile.length} games • Time to face the music
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/stats">
              <Button variant="outline">
                📊 Reality Check
              </Button>
            </Link>
            <Link href="/cemetery">
              <Button variant="outline">
                🪦 Cemetery
              </Button>
            </Link>
            <ImportLibraryButton />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="text-red-400 text-sm font-semibold">Unplayed</div>
            <div className="text-2xl font-bold">
              {pile.filter(entry => entry.status === 'unplayed').length}
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="text-yellow-400 text-sm font-semibold">Playing</div>
            <div className="text-2xl font-bold">
              {pile.filter(entry => entry.status === 'playing').length}
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="text-green-400 text-sm font-semibold">Completed</div>
            <div className="text-2xl font-bold">
              {pile.filter(entry => entry.status === 'completed').length}
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="text-purple-400 text-sm font-semibold">Amnesty</div>
            <div className="text-2xl font-bold">
              {pile.filter(entry => entry.status === 'amnesty_granted').length}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Games List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Games</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pile.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      entry.status === 'unplayed' ? 'border-red-500 bg-red-900/20' :
                      entry.status === 'playing' ? 'border-yellow-500 bg-yellow-900/20' :
                      entry.status === 'completed' ? 'border-green-500 bg-green-900/20' :
                      entry.status === 'abandoned' ? 'border-gray-500 bg-gray-900/20' :
                      'border-purple-500 bg-purple-900/20'
                    }`}
                  >
                    <img
                      src={entry.steam_game.image_url || '/default-game.png'}
                      alt={entry.steam_game.name}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{entry.steam_game.name}</h3>
                      <div className="text-sm text-slate-400">
                        {entry.playtime_minutes} minutes played
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.status === 'unplayed' ? 'bg-red-600' :
                        entry.status === 'playing' ? 'bg-yellow-600' :
                        entry.status === 'completed' ? 'bg-green-600' :
                        entry.status === 'abandoned' ? 'bg-gray-600' :
                        'bg-purple-600'
                      }`}>
                        {entry.status.replace('_', ' ')}
                      </span>
                      {entry.status === 'unplayed' && (
                        <Button variant="amnesty" size="sm">
                          Grant Amnesty
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Visualization */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Pile in 3D</h2>
              <div className="h-80">
                <PileVisualization
                  games={pile.map(entry => ({
                    id: entry.id,
                    name: entry.steam_game.name,
                    status: entry.status
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}