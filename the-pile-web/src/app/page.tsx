'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PileVisualization } from '@/components/pile-visualization'
import { 
  Gamepad2, 
  TrendingDown, 
  Users, 
  Trophy, 
  ArrowRight, 
  Clock,
  DollarSign,
  Heart,
  AlertTriangle,
  Sparkles,
  Zap,
  BarChart3,
  Shield
} from 'lucide-react'
import { useAuth } from '@/lib/auth-provider'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [animatedStats, setAnimatedStats] = useState({
    games: 0,
    money: 0,
    years: 0,
    completion: 0
  })

  // Animate stats on mount
  useEffect(() => {
    const targets = { games: 273, money: 4821, years: 47, completion: 12 }
    const duration = 2000
    const steps = 60
    const increment = duration / steps

    let current = { games: 0, money: 0, years: 0, completion: 0 }
    
    const timer = setInterval(() => {
      current = {
        games: Math.min(current.games + targets.games / steps, targets.games),
        money: Math.min(current.money + targets.money / steps, targets.money),
        years: Math.min(current.years + targets.years / steps, targets.years),
        completion: Math.min(current.completion + targets.completion / steps, targets.completion)
      }
      
      setAnimatedStats({
        games: Math.floor(current.games),
        money: Math.floor(current.money),
        years: Math.floor(current.years),
        completion: Math.floor(current.completion)
      })

      if (current.games >= targets.games) {
        clearInterval(timer)
      }
    }, increment)

    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-red-600/5 animate-pulse" />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          {/* Logo and branding */}
          <div className="flex items-center justify-center mb-6 gap-4">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-red-500 to-purple-500 opacity-50 animate-pulse" />
              <Gamepad2 className="h-16 w-16 text-white relative z-10" />
            </div>
            <h1 className="text-7xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
              The Pile
            </h1>
          </div>
          
          <p className="text-xl text-slate-300 mb-4 max-w-3xl mx-auto font-medium">
            The brutally honest Steam backlog tracker that turns your shame into insights
          </p>
          
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of gamers finally confronting their digital hoarding habits. 
            Import your Steam library, face the truth, and grant amnesty to games you'll never play.
          </p>
          
          {/* Live stats ticker */}
          <div className="flex flex-wrap gap-6 justify-center mb-10 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto border border-slate-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{animatedStats.games}</div>
              <div className="text-sm text-slate-400">Unplayed Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">${animatedStats.money}</div>
              <div className="text-sm text-slate-400">Money "Invested"</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{animatedStats.years}</div>
              <div className="text-sm text-slate-400">Years to Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{animatedStats.completion}%</div>
              <div className="text-sm text-slate-400">Completion Rate</div>
            </div>
          </div>
          
          {/* CTA Buttons with Steam branding */}
          <div className="flex gap-4 justify-center items-center flex-wrap">
            {user ? (
              <>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Continue to Dashboard
                  <Link href="/pile" className="absolute inset-0" />
                </Button>
                <Button variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Your Stats
                  <Link href="/stats" className="absolute inset-0" />
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="bg-[#171a21] hover:bg-[#1b2838] border border-[#2a475e] shadow-xl group">
                  <div className="flex items-center gap-2">
                    {/* Steam logo SVG */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1 15.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm6-5.5c-1.38 0-2.5-1.12-2.5-2.5S15.62 7 17 7s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="font-semibold">Login with Steam</span>
                  </div>
                  <Link href="/auth/steam" className="absolute inset-0" />
                </Button>
                <Button variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800 group">
                  <Sparkles className="mr-2 h-5 w-5 text-yellow-400 group-hover:animate-spin" />
                  See Live Demo
                  <Link href="#demo" className="absolute inset-0" />
                </Button>
              </>
            )}
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure Steam OAuth</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>10,000+ Users</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>No Judgment Zone</span>
            </div>
          </div>
        </div>
        
        {/* Demo Pile Visualization */}
        <div id="demo" className="max-w-5xl mx-auto mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="text-center mb-4">
            <span className="text-sm text-slate-400 uppercase tracking-wider">Interactive 3D Visualization</span>
          </div>
          <PileVisualization demo={true} />
        </div>
      </div>
      
      {/* How it Works Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          How The Pile Works
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Gamepad2, title: "Connect Steam", desc: "Secure OAuth login", color: "text-blue-400" },
            { icon: Zap, title: "Import Library", desc: "Analyze your games", color: "text-yellow-400" },
            { icon: BarChart3, title: "Get Insights", desc: "Face the truth", color: "text-green-400" },
            { icon: Sparkles, title: "Grant Amnesty", desc: "Let games go", color: "text-purple-400" }
          ].map((step, i) => (
            <div key={i} className="text-center group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-slate-800 rounded-full p-6 border border-slate-700 group-hover:border-slate-600 transition-colors">
                  <step.icon className={`h-8 w-8 mx-auto ${step.color}`} />
                </div>
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Features That Face Reality
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: TrendingDown,
              title: "Reality Check Engine",
              desc: "Calculate exactly how many years you need to finish your backlog. Spoiler: You won't live that long.",
              color: "from-red-500 to-orange-500",
              stat: "47 years average"
            },
            {
              icon: Trophy,
              title: "Shame Score Algorithm",
              desc: "A proprietary algorithm that quantifies your digital hoarding. Compare with friends, if you dare.",
              color: "from-yellow-500 to-amber-500",
              stat: "Score: 842/1000"
            },
            {
              icon: Users,
              title: "Amnesty System",
              desc: "Grant official forgiveness to games. Watch them float away in a satisfying animation. No guilt.",
              color: "from-purple-500 to-pink-500",
              stat: "1.2M games forgiven"
            },
            {
              icon: Clock,
              title: "Playtime Analytics",
              desc: "Track your actual vs. intended playtime. Discover which genres you buy but never actually play.",
              color: "from-blue-500 to-cyan-500",
              stat: "3hr avg/game"
            },
            {
              icon: DollarSign,
              title: "Financial Reality",
              desc: "See the true cost of your addiction. Calculate cost-per-hour for games you've actually played.",
              color: "from-green-500 to-emerald-500",
              stat: "$4,821 unplayed"
            },
            {
              icon: AlertTriangle,
              title: "Behavioral Insights",
              desc: "AI-powered insights into your buying patterns. Learn why you can't resist that Steam sale.",
              color: "from-orange-500 to-red-500",
              stat: "73% sale purchases"
            }
          ].map((feature, i) => (
            <Card 
              key={i}
              className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-slate-700 hover:border-slate-600"
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <CardContent className="relative p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10 mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-300 mb-4">{feature.desc}</p>
                
                <div className="text-xs font-mono text-slate-500 bg-slate-800/50 rounded px-2 py-1 inline-block">
                  {feature.stat}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Social Proof */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">What Gamers Are Saying</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Finally, a tracker that gets my shame.", author: "@SteamHoarder" },
              { quote: "The amnesty feature changed my life.", author: "@BacklogBoss" },
              { quote: "I can't unsee my 47-year completion time.", author: "@IndieAddict" }
            ].map((testimonial, i) => (
              <div key={i} className="text-center">
                <p className="text-slate-300 italic mb-2">"{testimonial.quote}"</p>
                <p className="text-sm text-slate-500">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Final CTA */}
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Your Pile Awaits
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Stop lying to yourself about "getting to it someday." 
            Join the confession booth of gaming shame.
          </p>
          
          <div className="flex gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl text-lg px-8 py-6">
              <Gamepad2 className="mr-2 h-6 w-6" />
              Start Your Confession
              <Link href="/auth/steam" className="absolute inset-0" />
            </Button>
          </div>
          
          <p className="text-sm text-slate-500 mt-6">
            Free forever • No credit card • Just brutal honesty
          </p>
        </div>
      </div>
      
      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}