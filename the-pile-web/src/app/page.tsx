'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { TAGLINES, getRandomItem, CTA_TEXTS } from '@/lib/humor-constants'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  
  // Use useEffect to set random values after mount to avoid SSR issues
  const [tagline, setTagline] = useState(TAGLINES[0]) // Default to first item
  const [ctaText, setCtaText] = useState(CTA_TEXTS.login[0]) // Default to first item
  
  useEffect(() => {
    // Set random values on client side after mount
    setTagline(getRandomItem(TAGLINES))
    setCtaText(getRandomItem(CTA_TEXTS.login))
  }, []) // Empty dependency array means this runs once after mount
  
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
            {tagline}
          </p>
          
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Import your Steam library, face the truth, and grant amnesty to games you&apos;ll never play.
          </p>
          
          {/* Live stats ticker */}
          <div className="flex flex-wrap gap-6 justify-center mb-10 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto border border-slate-700/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{animatedStats.games}</div>
              <div className="text-sm text-slate-400">Unplayed Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">${animatedStats.money}</div>
              <div className="text-sm text-slate-400">Money &quot;Invested&quot;</div>
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
                <Link href="/pile">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Continue to Dashboard
                  </Button>
                </Link>
                <Link href="/stats">
                  <Button variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Your Stats
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/steam">
                  <Button variant="steam" size="lg" className="shadow-xl group">
                    <div className="flex items-center gap-2">
                      {/* Steam logo SVG */}
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1 15.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm6-5.5c-1.38 0-2.5-1.12-2.5-2.5S15.62 7 17 7s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span className="font-semibold">Login with Steam</span>
                    </div>
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800 group">
                    <Sparkles className="mr-2 h-5 w-5 text-yellow-400 group-hover:animate-spin" />
                    See Live Demo
                  </Button>
                </Link>
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
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>No Judgment Zone</span>
            </div>
          </div>
        </div>
        
        {/* Interactive Demo Section */}
        <div id="demo" className="max-w-6xl mx-auto mb-16 relative">
          <div className="text-center mb-8">
            <span className="text-sm text-slate-400 uppercase tracking-wider mb-2 block">See it in action</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Your Shame, Quantified
            </h2>
          </div>
          
          {/* Mock dashboard preview */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Mock game cards */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-3">Your Pile Snapshot</h3>
                <div className="space-y-3">
                  {[
                    { name: "Elden Ring", status: "unplayed", time: "0h", price: "$59.99", color: "red" },
                    { name: "Hades", status: "playing", time: "12h", price: "$24.99", color: "yellow" },
                    { name: "Hollow Knight", status: "completed", time: "45h", price: "$14.99", color: "green" },
                    { name: "Cyberpunk 2077", status: "amnesty", time: "2h", price: "$59.99", color: "purple" }
                  ].map((game, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded bg-gradient-to-br from-${game.color}-500/20 to-${game.color}-600/20 flex items-center justify-center`}>
                          <Gamepad2 className={`h-6 w-6 text-${game.color}-400`} />
                        </div>
                        <div>
                          <p className="font-medium">{game.name}</p>
                          <p className="text-xs text-slate-400">{game.time} played • {game.price}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full bg-${game.color}-500/20 text-${game.color}-400 border border-${game.color}-500/30`}>
                        {game.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Behavioral insight card */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-orange-300 mb-1">Pattern Detected</h4>
                    <p className="text-sm text-slate-300">
                      You buy RPGs during sales but only have 12% completion rate. 
                      Your last 5 RPG purchases remain unplayed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Stats and insights */}
            <div className="space-y-4">
              {/* Shame score card */}
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Shame Score</h3>
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  842
                </div>
                <p className="text-sm text-slate-400 mb-4">Rank: <span className="text-purple-400">Digital Hoarder</span></p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Unplayed games</span>
                    <span className="text-red-400">+420 pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Money wasted</span>
                    <span className="text-orange-400">+280 pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Years to complete</span>
                    <span className="text-yellow-400">+142 pts</span>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <DollarSign className="h-5 w-5 text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-green-400">$4,821</div>
                  <p className="text-xs text-slate-400">Unplayed value</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <Clock className="h-5 w-5 text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-blue-400">2,847h</div>
                  <p className="text-xs text-slate-400">Time needed</p>
                </div>
              </div>
              
              {/* Amnesty preview */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Ready for Amnesty?</h4>
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  17 games haven&apos;t been touched in over 2 years. Time to let them go?
                </p>
                <Button size="sm" className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300">
                  Grant Amnesty →
                </Button>
              </div>
            </div>
          </div>
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
              stat: "Guilt-free abandonment"
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
      
      {/* Final CTA */}
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Your Pile Awaits
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Stop lying to yourself about &quot;getting to it someday.&quot; 
            Join the confession booth of gaming shame.
          </p>
          
          <div className="flex gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl text-lg px-8 py-6">
              <Gamepad2 className="mr-2 h-6 w-6" />
              {ctaText}
              <Link href="/auth/steam" className="absolute inset-0" />
            </Button>
          </div>
          
          <p className="text-sm text-slate-500 mt-6">
            Free forever • No credit card • Just brutal honesty
          </p>
        </div>
      </div>
      
    </div>
  )
}