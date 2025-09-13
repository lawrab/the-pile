'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pileApi, statsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-provider'
import { PileVisualization } from '@/components/pile-visualization'
import { EcosystemMonument } from '@/components/ecosystem-monument'
import { SacredAltar } from '@/components/sacred-relic'
import { GameGraveyard } from '@/components/game-tombstone'
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Atmospheric Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-5xl font-bold mb-4 mystical-glow" style={{ fontFamily: 'Crimson Text, serif' }}>
              ⚱️ The Pile of Regret
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-yellow-600/20 to-transparent blur-sm -z-10" />
          </div>
          <p className="text-xl text-gray-300 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            {pile.length} souls await redemption in the digital afterlife
          </p>
          <p className="text-sm text-gray-500 italic">
            Each game a promise made, each unplayed title a weight upon the spirit
          </p>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Link href="/stats">
            <Button variant="outline" className="mystical-glow hover:glow-playing">
              📊 Divine Reckoning
            </Button>
          </Link>
          <Link href="/cemetery">
            <Button variant="outline" className="hover:glow-amnesty">
              🪦 The Eternal Garden
            </Button>
          </Link>
          <ImportLibraryButton />
        </div>

        {/* Sacred Altar */}
        <SacredAltar 
          pile={pile} 
          className="mb-12" 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Graveyard */}
          <div className="lg:col-span-2">
            <GameGraveyard 
              pile={pile}
              activeFilter={activeFilter}
              onGameClick={setSelectedGame}
              onGrantAmnesty={(gameId) => {
                grantAmnesty.mutate({ gameId, reason: 'Granted peace from the pile' })
              }}
              onStartPlaying={(gameId) => {
                startPlaying.mutate(gameId)
              }}
            />
          </div>

          {/* The Evolving Ecosystem */}
          <div className="lg:col-span-1">
            <div className="
              bg-gradient-to-br from-green-950/20 to-purple-950/30
              border border-green-800/20
              rounded-2xl p-6
              texture-overlay
              transition-all duration-500
            "
            style={{
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.05),
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 0 64px hsla(var(--status-completed), 0.1)
              `
            }}
            >
              <div className="text-center mb-6">
                <h2 
                  className="text-2xl font-bold mb-2 text-green-200" 
                  style={{ fontFamily: 'Crimson Text, serif' }}
                >
                  🌱 The Digital Ecosystem
                </h2>
                <p className="text-gray-400 text-sm italic leading-relaxed">
                  Watch your barren wasteland of regret transform into a flourishing 
                  garden of achievement as you nurture each digital seed to life
                </p>
              </div>
              
              <EcosystemMonument
                games={pile.map(entry => ({
                  id: entry.id,
                  name: entry.steam_game.name,
                  status: entry.status,
                  playtime_minutes: entry.playtime_minutes
                }))}
                activeFilter={activeFilter}
                onGameClick={(game) => {
                  // Find the full game data from pile
                  const fullGameData = pile.find(entry => entry.id === game.id)
                  if (fullGameData) {
                    setSelectedGame(fullGameData)
                  }
                }}
              />
            </div>
          </div>
        </div>

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