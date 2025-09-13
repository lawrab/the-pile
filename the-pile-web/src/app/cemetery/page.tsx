'use client'

import { useQuery } from '@tanstack/react-query'
import { pileApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-provider'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

export default function CemeteryPage() {
  const { user } = useAuth()

  const { data: pile, isLoading } = useQuery({
    queryKey: ['pile'],
    queryFn: async () => {
      const response = await pileApi.getPile()
      return response.data
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your cemetery</h1>
          <Link href="/auth/steam">
            <Button>Login with Steam</Button>
          </Link>
        </div>
      </div>
    )
  }

  const amnestyGames = pile?.filter(entry => entry.status === 'amnesty_granted') || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/pile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">🪦 The Cemetery</h1>
            <p className="text-slate-400">
              Games you've officially given up on - with honor and dignity
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-5 w-5 bg-purple-500 rounded" />
              <h3 className="font-semibold">Total Amnesty</h3>
            </div>
            <div className="text-2xl font-bold">
              {amnestyGames.length}
            </div>
            <div className="text-sm text-slate-400">
              games granted peace
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold">Most Recent</h3>
            </div>
            <div className="text-lg font-bold">
              {amnestyGames.length > 0 
                ? new Date(amnestyGames[0].amnesty_date || '').toLocaleDateString()
                : 'None yet'
              }
            </div>
            <div className="text-sm text-slate-400">
              last amnesty granted
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold">Freedom Rate</h3>
            </div>
            <div className="text-lg font-bold">
              {pile ? Math.round((amnestyGames.length / pile.length) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-400">
              of pile freed
            </div>
          </div>
        </div>

        {/* Cemetery Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-slate-400">Loading your cemetery...</div>
          </div>
        ) : amnestyGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">Empty Cemetery</h3>
            <p className="text-slate-400 mb-4">
              You haven't granted amnesty to any games yet.
            </p>
            <p className="text-sm text-slate-500">
              Sometimes it's okay to admit you'll never play that game you bought on sale.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Games at Rest ({amnestyGames.length})
            </h2>
            
            <div className="grid gap-4">
              {amnestyGames.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-slate-800 p-4 rounded-lg flex items-center gap-4 opacity-75 hover:opacity-90 transition-opacity"
                >
                  <img
                    src={entry.steam_game.image_url || '/default-game.png'}
                    alt={entry.steam_game.name}
                    className="w-16 h-16 rounded object-cover grayscale"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-300">
                      {entry.steam_game.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-1">
                      Granted amnesty on {new Date(entry.amnesty_date || '').toLocaleDateString()}
                    </p>
                    {entry.amnesty_reason && (
                      <p className="text-sm text-slate-400 italic">
                        "{entry.amnesty_reason}"
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-purple-400 font-semibold">
                      ✨ At Peace
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.playtime_minutes > 0 
                        ? `${Math.round(entry.playtime_minutes / 60)}h played`
                        : 'Never played'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

        {/* Philosophy */}
        <div className="mt-12 text-center">
          <div className="bg-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">The Cemetery Philosophy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Not every game needs to be completed. Some games enter our libraries during sales, 
              bundles, or moments of optimism. The Cemetery is a place of honor for games that 
              served their purpose simply by existing in your collection. Here, they rest in 
              digital peace, free from the burden of your expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}