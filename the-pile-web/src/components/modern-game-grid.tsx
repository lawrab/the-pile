'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PileEntry, GameStatus } from '@/types'
import { 
  Play, 
  Trophy, 
  Clock, 
  DollarSign,
  Filter,
  Grid3X3,
  List,
  Search
} from 'lucide-react'

interface ModernGameGridProps {
  pile: PileEntry[]
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
  onGameClick: (game: PileEntry) => void
  onGrantAmnesty: (gameId: number) => void
  onStartPlaying: (gameId: number) => void
}

export function ModernGameGrid({
  pile,
  activeFilter,
  onFilterChange,
  onGameClick,
  onGrantAmnesty,
  onStartPlaying
}: ModernGameGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter games based on active filter and search
  const filteredGames = pile.filter(game => {
    const matchesFilter = !activeFilter || game.status === activeFilter
    const matchesSearch = !searchTerm || 
      game.steam_game.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Status counts for filter buttons
  const statusCounts = {
    [GameStatus.UNPLAYED]: pile.filter(g => g.status === GameStatus.UNPLAYED).length,
    [GameStatus.PLAYING]: pile.filter(g => g.status === GameStatus.PLAYING).length,
    [GameStatus.COMPLETED]: pile.filter(g => g.status === GameStatus.COMPLETED).length,
    [GameStatus.ABANDONED]: pile.filter(g => g.status === GameStatus.ABANDONED).length,
    [GameStatus.AMNESTY_GRANTED]: pile.filter(g => g.status === GameStatus.AMNESTY_GRANTED).length,
  }

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case GameStatus.UNPLAYED: return 'bg-red-500/20 text-red-300 border-red-500/30'
      case GameStatus.PLAYING: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case GameStatus.COMPLETED: return 'bg-green-500/20 text-green-300 border-green-500/30'
      case GameStatus.ABANDONED: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case GameStatus.AMNESTY_GRANTED: return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const getStatusLabel = (status: GameStatus) => {
    switch (status) {
      case GameStatus.UNPLAYED: return 'Not Started'
      case GameStatus.PLAYING: return 'In Progress'
      case GameStatus.COMPLETED: return 'Completed'
      case GameStatus.ABANDONED: return 'Abandoned'
      case GameStatus.AMNESTY_GRANTED: return 'Amnesty Granted'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search your pile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={!activeFilter ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(null)}
              className="text-sm"
            >
              All Games ({pile.length})
            </Button>
            
            {Object.entries(statusCounts).map(([status, count]) => (
              count > 0 && (
                <Button
                  key={status}
                  variant={activeFilter === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onFilterChange(activeFilter === status ? null : status)}
                  className="text-sm"
                >
                  {getStatusLabel(status as GameStatus)} ({count})
                </Button>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          {activeFilter && ` • ${getStatusLabel(activeFilter as GameStatus)}`}
          {searchTerm && ` • "${searchTerm}"`}
        </h2>
      </div>

      {/* Game Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map((game) => (
            <Card 
              key={game.id} 
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
              onClick={() => onGameClick(game)}
            >
              <CardContent className="p-4">
                <div className="aspect-[460/215] relative mb-3 rounded-lg overflow-hidden bg-slate-700">
                  {game.steam_game.image_url ? (
                    <img 
                      src={game.steam_game.image_url}
                      alt={game.steam_game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Play className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {game.steam_game.name}
                </h3>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className={`inline-block px-2 py-1 rounded-full border text-xs ${getStatusColor(game.status)}`}>
                    {getStatusLabel(game.status)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{Math.floor((game.playtime_minutes || 0) / 60)}h {(game.playtime_minutes || 0) % 60}m</span>
                  </div>
                  
                  {game.purchase_price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      <span>${game.purchase_price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGames.map((game) => (
            <Card 
              key={game.id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              onClick={() => onGameClick(game)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 rounded overflow-hidden bg-slate-700 flex-shrink-0">
                    {game.steam_game.image_url ? (
                      <img 
                        src={game.steam_game.image_url}
                        alt={game.steam_game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Play className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate hover:text-blue-400 transition-colors">
                      {game.steam_game.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className={`px-2 py-1 rounded-full border text-xs ${getStatusColor(game.status)}`}>
                        {getStatusLabel(game.status)}
                      </div>
                      <span>{Math.floor((game.playtime_minutes || 0) / 60)}h {(game.playtime_minutes || 0) % 60}m played</span>
                      {game.purchase_price && <span>${game.purchase_price.toFixed(2)}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {game.status === GameStatus.UNPLAYED && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartPlaying(game.id)
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGames.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <div className="text-slate-500 mb-2">No games found</div>
            <p className="text-sm text-slate-400">
              Try adjusting your filters or search term
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}