'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PileVisualization } from '@/components/pile-visualization'
import { Gamepad2, TrendingDown, Users, Trophy, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-provider'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            The Pile
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Your gaming backlog visualized as a towering pile of shame. 
            Finally confront those unplayed games with humor and brutal honesty.
          </p>
          
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/pile">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Continue to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/stats">
                    View Your Stats
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/auth/steam">
                    <Gamepad2 className="mr-2 h-5 w-5" />
                    Login with Steam
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#demo">
                    See Demo
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Demo Pile Visualization */}
        <div className="max-w-4xl mx-auto mb-16">
          <PileVisualization demo={true} />
        </div>
      </div>
      
      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 text-pile-shame" />
            <h3 className="text-xl font-semibold mb-2">Reality Check</h3>
            <p className="text-slate-300">
              "You'll finish your backlog in 47 years at your current pace."
            </p>
          </div>
          
          <div className="text-center p-6">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-semibold mb-2">Shame Score</h3>
            <p className="text-slate-300">
              Gamified metrics that quantify your pile of shame with humor.
            </p>
          </div>
          
          <div className="text-center p-6">
            <Users className="h-12 w-12 mx-auto mb-4 text-pile-amnesty" />
            <h3 className="text-xl font-semibold mb-2">Amnesty Mode</h3>
            <p className="text-slate-300">
              Officially give up on games without guilt. Watch them float away.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to face your pile?</h2>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
          Import your Steam library and discover the brutal truth about your gaming habits.
          Finally understand why you buy games you'll never play.
        </p>
        <Button size="lg" asChild>
          <Link href="/auth/steam">
            Start Your Confession
          </Link>
        </Button>
      </div>
    </div>
  )
}