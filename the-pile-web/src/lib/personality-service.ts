import { PileEntry, GameStatus } from '@/types'

interface PersonalityMessage {
  greeting: string
  subtext?: string
  emoji?: string
}

interface GameRecommendation {
  game: PileEntry
  reason: string
  confidence: 'high' | 'medium' | 'low'
  category: 'quick-win' | 'redemption-arc' | 'mercy-kill' | 'weekend-project'
}

interface ActionPlan {
  title: string
  description: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'play' | 'complete' | 'amnesty' | 'streak'
  targetGames?: PileEntry[]
}

export class PersonalityService {
  private static getTimeBasedGreeting(): string {
    const hour = new Date().getHours()
    
    if (hour < 6) return "Still up? Your pile grows while you sleep..."
    if (hour < 12) return "Morning! Ready to ignore more games today?"
    if (hour < 17) return "Afternoon procrastination session, I see"
    if (hour < 22) return "Evening! Perfect time to buy more games instead of playing"
    return "Late night pile viewing. Insomnia or guilt?"
  }

  static getGreeting(pile: PileEntry[], userName?: string): PersonalityMessage {
    if (!pile || pile.length === 0) {
      return {
        greeting: "Your pile is empty. This feels wrong.",
        subtext: "Quick, buy something on sale before anyone notices!",
        emoji: "🎮"
      }
    }

    const unplayedCount = pile.filter(e => e.status === GameStatus.UNPLAYED).length
    const totalValue = pile.reduce((sum, e) => sum + (e.purchase_price || 0), 0)
    const neverTouchedCount = pile.filter(e => e.playtime_minutes === 0).length
    const oldestUnplayed = pile
      .filter(e => e.status === GameStatus.UNPLAYED)
      .sort((a, b) => new Date(a.purchase_date || 0).getTime() - new Date(b.purchase_date || 0).getTime())[0]

    // Calculate days since oldest purchase
    const daysSinceOldest = oldestUnplayed?.purchase_date 
      ? Math.floor((Date.now() - new Date(oldestUnplayed.purchase_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const greetings: PersonalityMessage[] = [
      {
        greeting: `Welcome back! ${unplayedCount} games are judging you.`,
        subtext: `That's $${totalValue.toFixed(2)} of digital regret.`,
        emoji: "😅"
      },
      {
        greeting: `Oh, it's you again. Still haven't played ${oldestUnplayed?.steam_game?.name || 'that game'}?`,
        subtext: `It's been ${daysSinceOldest} days. It's basically vintage now.`,
        emoji: "📅"
      },
      {
        greeting: `${this.getTimeBasedGreeting()}`,
        subtext: `${neverTouchedCount} games remain untouched. They're starting to form a union.`,
        emoji: "🎯"
      },
      {
        greeting: `Your pile has achieved structural integrity!`,
        subtext: `${pile.length} games strong. NASA wants to study it.`,
        emoji: "🏗️"
      },
      {
        greeting: `Plot twist: You actually played something recently!`,
        subtext: `Don't worry, we won't tell the other ${unplayedCount - 1} games.`,
        emoji: "🎉"
      }
    ]

    // Special messages for extreme cases
    if (unplayedCount > 100) {
      return {
        greeting: "Your pile is visible from space.",
        subtext: `${unplayedCount} unplayed games. Even Steam is concerned.`,
        emoji: "🛸"
      }
    }

    if (neverTouchedCount > 50) {
      return {
        greeting: "Collection or addiction? The line is blurry.",
        subtext: `${neverTouchedCount} games with 0 minutes played. Impressive dedication to not playing.`,
        emoji: "🏆"
      }
    }

    if (totalValue > 1000) {
      return {
        greeting: "That's a mortgage payment worth of games.",
        subtext: `$${totalValue.toFixed(2)} invested in future disappointment.`,
        emoji: "💸"
      }
    }

    // Return random greeting
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  static getRecommendations(pile: PileEntry[]): GameRecommendation[] {
    const recommendations: GameRecommendation[] = []
    
    // Quick wins - short games or games with < 2 hours to complete
    const shortGames = pile
      .filter(e => e.status === GameStatus.UNPLAYED)
      .filter(e => {
        const genres = e.steam_game?.genres || []
        return genres.some(g => ['Indie', 'Puzzle', 'Platformer', 'Arcade'].includes(g))
      })
      .slice(0, 3)

    shortGames.forEach(game => {
      recommendations.push({
        game,
        reason: "Short game you could actually finish today",
        confidence: 'high',
        category: 'quick-win'
      })
    })

    // Games you started but abandoned
    const abandonedGames = pile
      .filter(e => e.status === GameStatus.ABANDONED || (e.playtime_minutes > 0 && e.playtime_minutes < 120))
      .slice(0, 2)

    abandonedGames.forEach(game => {
      recommendations.push({
        game,
        reason: `You played ${game.playtime_minutes} minutes. Maybe give it another shot?`,
        confidence: 'medium',
        category: 'redemption-arc'
      })
    })

    // Old games that need amnesty
    const ancientGames = pile
      .filter(e => e.status === GameStatus.UNPLAYED)
      .filter(e => {
        if (!e.purchase_date) return false
        const yearsSince = (Date.now() - new Date(e.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365)
        return yearsSince > 3
      })
      .slice(0, 3)

    ancientGames.forEach(game => {
      const years = Math.floor((Date.now() - new Date(game.purchase_date!).getTime()) / (1000 * 60 * 60 * 24 * 365))
      recommendations.push({
        game,
        reason: `${years} years old. Time to let go?`,
        confidence: 'high',
        category: 'mercy-kill'
      })
    })

    // Recently purchased - strike while interested
    const recentPurchases = pile
      .filter(e => e.status === GameStatus.UNPLAYED)
      .filter(e => {
        if (!e.purchase_date) return false
        const daysSince = (Date.now() - new Date(e.purchase_date).getTime()) / (1000 * 60 * 60 * 24)
        return daysSince < 30
      })
      .slice(0, 2)

    recentPurchases.forEach(game => {
      recommendations.push({
        game,
        reason: "Recently bought - play it while you still remember why",
        confidence: 'medium',
        category: 'weekend-project'
      })
    })

    return recommendations
  }

  static getActionPlan(pile: PileEntry[]): ActionPlan[] {
    const plans: ActionPlan[] = []
    const unplayedCount = pile.filter(e => e.status === GameStatus.UNPLAYED).length
    const neverTouchedGames = pile.filter(e => e.playtime_minutes === 0)
    
    // Daily quick win
    plans.push({
      title: "Today's Quick Win",
      description: "Play ANY game for 30 minutes",
      points: 20,
      difficulty: 'easy',
      type: 'play',
      targetGames: pile.filter(e => e.status === GameStatus.UNPLAYED).slice(0, 5)
    })

    // Weekend warrior
    if (new Date().getDay() === 5 || new Date().getDay() === 6) {
      plans.push({
        title: "Weekend Warrior",
        description: "Complete a short indie game this weekend",
        points: 50,
        difficulty: 'medium',
        type: 'complete',
        targetGames: pile
          .filter(e => e.status === GameStatus.UNPLAYED)
          .filter(e => e.steam_game?.genres?.includes('Indie'))
          .slice(0, 3)
      })
    }

    // The purge
    if (unplayedCount > 20) {
      plans.push({
        title: "The Great Purge",
        description: "Grant amnesty to 5 games you'll never play",
        points: 30,
        difficulty: 'easy',
        type: 'amnesty',
        targetGames: pile
          .filter(e => e.status === GameStatus.UNPLAYED)
          .filter(e => {
            if (!e.purchase_date) return false
            const yearsSince = (Date.now() - new Date(e.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365)
            return yearsSince > 2
          })
          .slice(0, 5)
      })
    }

    // Zero to hero
    if (neverTouchedGames.length > 0) {
      plans.push({
        title: "Break the Seal",
        description: "Launch a game with 0 playtime",
        points: 25,
        difficulty: 'easy',
        type: 'play',
        targetGames: neverTouchedGames.slice(0, 3)
      })
    }

    // Streak challenge
    plans.push({
      title: "Consistency Challenge",
      description: "Play games 3 days in a row",
      points: 40,
      difficulty: 'medium',
      type: 'streak'
    })

    return plans
  }

  static getMotivationalMessage(action: 'play' | 'complete' | 'amnesty' | 'buy'): string {
    const messages = {
      play: [
        "Look at you, actually playing games!",
        "The pile trembles as you chip away at it.",
        "One small step for a gamer, one giant leap for your backlog.",
        "Your other games are jealous now."
      ],
      complete: [
        "You actually finished something! 🎉",
        "Achievement unlocked: Follow-through!",
        "The legends are true - games CAN be completed!",
        "Your pile sheds a single tear of joy."
      ],
      amnesty: [
        "Sometimes letting go is the bravest choice.",
        "It's not giving up, it's strategic pile management.",
        "Marie Kondo would be proud.",
        "That game is free now. Free!"
      ],
      buy: [
        "The pile grows stronger...",
        "Your wallet weeps, your pile rejoices.",
        "Future you will deal with this.",
        "Sale resistance: Failed"
      ]
    }

    const actionMessages = messages[action]
    return actionMessages[Math.floor(Math.random() * actionMessages.length)]
  }

  static getPileAnalysis(pile: PileEntry[]): string[] {
    const insights: string[] = []
    
    // Genre analysis
    const genreCounts: Record<string, number> = {}
    pile.forEach(entry => {
      entry.steam_game?.genres?.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      })
    })
    
    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]
    if (topGenre) {
      insights.push(`You really love ${topGenre[0]} games (${topGenre[1]} in pile)`)
    }

    // Purchase patterns
    const saleGames = pile.filter(e => e.purchase_price && e.steam_game?.price && e.purchase_price < e.steam_game.price * 0.5)
    if (saleGames.length > pile.length * 0.6) {
      insights.push(`${Math.round((saleGames.length / pile.length) * 100)}% bought on sale. You have a weakness.`)
    }

    // Playtime reality
    const totalPlaytimeHours = pile.reduce((sum, e) => sum + (e.playtime_minutes || 0), 0) / 60
    const estimatedCompletionHours = pile.filter(e => e.status === GameStatus.UNPLAYED).length * 20 // Assume 20 hours per game
    const yearsToComplete = estimatedCompletionHours / (totalPlaytimeHours / (pile.length > 0 ? 1 : 1))
    
    if (yearsToComplete > 10) {
      insights.push(`At current pace, you'll finish in ${Math.round(yearsToComplete)} years`)
    }

    return insights
  }
}