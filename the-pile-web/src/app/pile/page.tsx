'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pileApi, statsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-provider'
import { PersonalityDashboard } from '@/components/personality-dashboard'
import { ModernGameGrid } from '@/components/modern-game-grid'
import { GameDetailModal } from '@/components/game-detail-modal'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateShameLevel } from '@/lib/utils'
import { Download, Zap, Trophy, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { usePile, useGameStatusMutations } from '@/lib/hooks'
import { ImportLibraryButton } from '@/components/import-library-button'

export default function PilePage() {
  const { user } = useAuth()
  const { data: pile, isLoading } = usePile(!!user)
  const { grantAmnesty, startPlaying, markCompleted } = useGameStatusMutations()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  
  // Fetch shame score for the personality dashboard
  const { data: shameScore } = useQuery({
    queryKey: ['shameScore'],
    queryFn: async () => {
      const response = await statsApi.getShameScore()
      return response.data
    },
    enabled: !!user && !!pile && pile.length > 0,
  })

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
    const loadingMessages = [
      "Calculating your shame...",
      "Counting unplayed games...",
      "Measuring the pile height...",
      "Summoning your backlog demons...",
      "Dusting off forgotten purchases...",
      "Tallying regrettable decisions..."
    ]
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">{randomMessage}</h1>
          <p className="text-slate-400 text-sm">This might take a moment of reflection...</p>
        </div>
      </div>
    )
  }

  if (!pile || pile.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-6">🎮 Your Pile is Empty</h1>
          <p className="text-slate-300 text-lg mb-8">
            Import your Steam library to start tracking your games and build your pile of shame!
          </p>
          <ImportLibraryButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Personality Dashboard - New engaging header */}
        <div className="mb-8">
          <PersonalityDashboard 
            pile={pile} 
            userName={user.username}
            shameScore={shameScore?.score || 0}
          />
        </div>

        {/* Clean Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link href="/stats">
            <Button variant="outline" className="text-base">
              📊 My Stats
            </Button>
          </Link>
          <Link href="/cemetery">
            <Button variant="outline" className="text-base">
              🪦 Amnesty Archive
            </Button>
          </Link>
          <ImportLibraryButton />
        </div>

        {/* Modern Game Management */}
        <ModernGameGrid
          pile={pile}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onGameClick={setSelectedGame}
          onGrantAmnesty={(gameId) => {
            grantAmnesty.mutate({ gameId, reason: 'Strategic pile management' })
          }}
          onStartPlaying={(gameId) => {
            startPlaying.mutate(gameId)
          }}
        />

        {/* Game Detail Modal */}
        {selectedGame && (
          <GameDetailModal
            isOpen={!!selectedGame}
            onClose={() => setSelectedGame(null)}
            game={selectedGame}
            onGrantAmnesty={(gameId) => {
              grantAmnesty.mutate({ gameId, reason: 'Granted peace from the modal' })
              setSelectedGame(null)
            }}
            onStartPlaying={(gameId) => {
              startPlaying.mutate(gameId)
              setSelectedGame(null)
            }}
            onMarkCompleted={(gameId) => {
              markCompleted.mutate(gameId)
              setSelectedGame(null)
            }}
          />
        )}
      </div>
    </div>
  )
}