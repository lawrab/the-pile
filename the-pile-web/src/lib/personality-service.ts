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

export interface ActionPlan {
  title: string
  description: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'play' | 'complete' | 'amnesty' | 'streak'
  targetGames?: PileEntry[]
}

interface PileTimeline {
  startDate: Date
  daysSince: number
  totalSpent: number
  monthlyAverage: number
  excuses: string[]
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
    const timeline = this.getPileTimeline(pile)
    
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
      },
      {
        greeting: `Your oldest unplayed game is ${Math.floor(timeline.daysSince / 365)} years old!`,
        subtext: `Released ${timeline.startDate.toLocaleDateString()} - it's practically vintage now.`,
        emoji: "📈"
      },
      {
        greeting: `Some games have been patiently waiting!`,
        subtext: `Your oldest unplayed dates back to ${timeline.startDate.toLocaleDateString()}. ${timeline.daysSince >= 365 ? "It's aged like fine wine!" : "Still fresh though!"}`,
        emoji: "🌱"
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

  // Helper function to calculate rating boost for recommendations
  private static getRatingBoost(game: PileEntry): number {
    const rating = game.steam_game?.steam_rating_percent
    if (!rating) return 0
    
    // Give slight boost to highly rated games (85%+), moderate boost to very highly rated (90%+)
    if (rating >= 90) return 0.3  // Strong boost for exceptional games
    if (rating >= 85) return 0.2  // Moderate boost for great games  
    if (rating >= 70) return 0.1  // Small boost for good games
    return 0 // No boost for mixed/negative games, but don't penalize
  }

  // Helper function to sort games by rating (for tie-breaking)
  private static sortByRatingAndAge(games: PileEntry[]): PileEntry[] {
    return games.sort((a, b) => {
      // First priority: Steam rating (higher is better)
      const ratingA = a.steam_game?.steam_rating_percent || 0
      const ratingB = b.steam_game?.steam_rating_percent || 0
      if (ratingA !== ratingB) return ratingB - ratingA
      
      // Second priority: Purchase date (older games get slight preference)
      const dateA = new Date(a.purchase_date || '').getTime()
      const dateB = new Date(b.purchase_date || '').getTime()
      return dateA - dateB
    })
  }

  private static isValidGame(entry: PileEntry): boolean {
    const game = entry.steam_game
    if (!game || !game.name) return false
    
    // Only include unplayed games - exclude amnesty, completed, abandoned games
    if (entry.status !== GameStatus.UNPLAYED) {
      return false
    }
    
    // Filter by Steam type - only include actual games
    if (game.steam_type && game.steam_type !== 'game') {
      return false
    }
    
    // Filter out non-game categories
    const categories = game.categories || []
    const nonGameCategories = [
      'Software',
      'Software Training', 
      'Utilities',
      'Video Production',
      'Audio Production',
      'Design & Illustration',
      'Animation & Modeling',
      'Web Publishing',
      'Education',
      'Game Development'
    ]
    
    if (categories.some(cat => nonGameCategories.includes(cat))) {
      return false
    }
    
    // Filter out games with no meaningful description
    if (!game.description || game.description.trim().length < 10) {
      return false
    }
    
    return true
  }

  static getRecommendations(pile: PileEntry[]): GameRecommendation[] {
    const recommendations: GameRecommendation[] = []
    
    // Quick wins - short games or games with < 2 hours to complete
    const shortGames = this.sortByRatingAndAge(
      pile
        .filter(e => e.status === GameStatus.UNPLAYED)
        .filter(e => this.isValidGame(e))
        .filter(e => {
          const genres = e.steam_game?.genres || []
          return genres.some(g => ['Indie', 'Puzzle', 'Platformer', 'Arcade'].includes(g))
        })
    ).slice(0, 3)

    shortGames.forEach(game => {
      const ratingBoost = this.getRatingBoost(game)
      const baseConfidence = 0.7 // Base confidence for quick wins
      const finalConfidence = Math.min(baseConfidence + ratingBoost, 1.0)
      
      const rating = game.steam_game?.steam_rating_percent
      const ratingText = rating >= 90 ? " (Highly rated!)" : rating >= 85 ? " (Well reviewed)" : ""
      
      recommendations.push({
        game,
        reason: `Short game you could actually finish today${ratingText}`,
        confidence: finalConfidence >= 0.85 ? 'high' : finalConfidence >= 0.6 ? 'medium' : 'low',
        category: 'quick-win'
      })
    })

    // Games you started but abandoned - sort by rating to prioritize well-reviewed games
    const abandonedGames = this.sortByRatingAndAge(
      pile.filter(e => e.status === GameStatus.ABANDONED || (e.playtime_minutes > 0 && e.playtime_minutes < 120))
    ).slice(0, 2)

    abandonedGames.forEach(game => {
      const ratingBoost = this.getRatingBoost(game)
      const baseConfidence = 0.5 // Lower base confidence for abandoned games
      const finalConfidence = Math.min(baseConfidence + ratingBoost, 1.0)
      
      const rating = game.steam_game?.steam_rating_percent
      const ratingText = rating >= 85 ? " Great reviews suggest it's worth the retry!" : ""
      
      recommendations.push({
        game,
        reason: `You played ${game.playtime_minutes} minutes. Maybe give it another shot?${ratingText}`,
        confidence: finalConfidence >= 0.75 ? 'high' : finalConfidence >= 0.5 ? 'medium' : 'low',
        category: 'redemption-arc'
      })
    })

    // Highly rated old games that deserve attention
    const hiddenGems = pile
      .filter(e => e.status === GameStatus.UNPLAYED)
      .filter(e => this.isValidGame(e))
      .filter(e => {
        const rating = e.steam_game?.steam_rating_percent
        const purchaseDate = e.purchase_date ? new Date(e.purchase_date) : null
        const monthsOld = purchaseDate ? (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30) : 0
        
        return rating >= 85 && monthsOld >= 6 // Highly rated games older than 6 months
      })
      .sort((a, b) => (b.steam_game?.steam_rating_percent || 0) - (a.steam_game?.steam_rating_percent || 0))
      .slice(0, 2)

    hiddenGems.forEach(game => {
      const rating = game.steam_game?.steam_rating_percent || 0
      recommendations.push({
        game,
        reason: `${rating}% Steam rating - this hidden gem has been waiting too long!`,
        confidence: 'high',
        category: 'hidden-gem'
      })
    })

    // Old games that need amnesty (lower rated or very old)
    const ancientGames = pile
      .filter(e => e.status === GameStatus.UNPLAYED)
      .filter(e => this.isValidGame(e))
      .filter(e => !hiddenGems.includes(e)) // Exclude hidden gems we already recommended
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
      .filter(e => this.isValidGame(e))
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
    const neverTouchedGames = pile.filter(e => e.playtime_minutes === 0 && this.isValidGame(e))
    
    // Daily quick win
    plans.push({
      title: "Today's Quick Win",
      description: "Play ANY game for 30 minutes",
      points: 20,
      difficulty: 'easy',
      type: 'play',
      targetGames: pile.filter(e => e.status === GameStatus.UNPLAYED).filter(e => this.isValidGame(e)).slice(0, 5)
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
          .filter(e => this.isValidGame(e))
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
          .filter(e => this.isValidGame(e))
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

  static getPileTimeline(pile: PileEntry[]): PileTimeline {
    if (pile.length === 0) {
      return {
        startDate: new Date(),
        daysSince: 0,
        totalSpent: 0,
        monthlyAverage: 0,
        excuses: ["No pile yet - you're still innocent!"]
      }
    }

    // Find the oldest unplayed game by release date to show how long games have been waiting
    const oldestUnplayedGame = pile
      .filter(entry => entry.status === 'unplayed' && entry.steam_game.release_date)
      .map(entry => ({
        ...entry,
        parsedReleaseDate: this.parseReleaseDate(entry.steam_game.release_date!)
      }))
      .filter(entry => entry.parsedReleaseDate)
      .sort((a, b) => a.parsedReleaseDate!.getTime() - b.parsedReleaseDate!.getTime())[0]

    // Use the oldest game's release date as the "pile age" - how long games have been accumulating
    const startDate = oldestUnplayedGame?.parsedReleaseDate || new Date()
    const daysSince = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const totalSpent = pile.reduce((sum, entry) => sum + (entry.purchase_price || 0), 0)
    
    // Calculate "acquisition span" - time between oldest and newest game releases
    const newestGame = pile
      .map(entry => ({
        ...entry,
        parsedReleaseDate: this.parseReleaseDate(entry.steam_game.release_date || '')
      }))
      .filter(entry => entry.parsedReleaseDate)
      .sort((a, b) => b.parsedReleaseDate!.getTime() - a.parsedReleaseDate!.getTime())[0]
    
    const acquisitionSpanDays = newestGame && oldestUnplayedGame 
      ? Math.floor((newestGame.parsedReleaseDate!.getTime() - oldestUnplayedGame.parsedReleaseDate!.getTime()) / (1000 * 60 * 60 * 24))
      : daysSince
    
    const monthlyAverage = totalSpent / Math.max(acquisitionSpanDays / 30, 1)

    return {
      startDate,
      daysSince,
      totalSpent,
      monthlyAverage,
      excuses: this.generatePartnerExcuses(daysSince, totalSpent, pile.length, oldestUnplayedGame?.steam_game.name, acquisitionSpanDays)
    }
  }

  private static parseReleaseDate(releaseDate: string): Date | null {
    if (!releaseDate) return null
    
    // Steam release dates can be in various formats:
    // "Dec 1, 2023", "2023", "Coming soon", "To be announced", etc.
    
    // Handle "Coming soon" and similar
    if (releaseDate.toLowerCase().includes('coming soon') || 
        releaseDate.toLowerCase().includes('to be announced') ||
        releaseDate.toLowerCase().includes('tba')) {
      return null
    }
    
    // Try to parse common formats
    try {
      // Handle year-only format like "2023"
      if (/^\d{4}$/.test(releaseDate.trim())) {
        return new Date(parseInt(releaseDate), 0, 1) // January 1st of that year
      }
      
      // Handle full date formats
      const parsed = new Date(releaseDate)
      return isNaN(parsed.getTime()) ? null : parsed
    } catch {
      return null
    }
  }

  private static generatePartnerExcuses(
    daysSince: number, 
    totalSpent: number, 
    gameCount: number, 
    oldestGameName?: string,
    acquisitionSpanDays?: number
  ): string[] {
    const excuses: string[] = []
    const years = Math.floor(daysSince / 365)
    const months = Math.floor(daysSince / 30)

    // Timeline-based excuses (based on oldest unplayed game's release date)
    if (oldestGameName && years >= 5) {
      excuses.push(`"${oldestGameName} came out ${years} years ago - it's practically retro gaming now!"`)
      excuses.push(`"I've been preserving ${years}-year-old games like a digital museum curator!"`)
    } else if (oldestGameName && years >= 2) {
      excuses.push(`"${oldestGameName} is ${years} years old - I'm letting it age like fine wine!"`)
    } else if (months >= 12) {
      excuses.push(`"These games span ${Math.floor((acquisitionSpanDays || daysSince) / 365)} years of gaming history - it's a timeline of my interests!"`)
    } else if (daysSince >= 30) {
      excuses.push(`"I'm building a collection that represents ${Math.floor(daysSince / 30)} months of gaming evolution!"`)
    } else {
      excuses.push(`"This represents the best games from recent releases - I'm staying current!"`)
    }

    // Financial excuses
    if (totalSpent > 1000) {
      excuses.push(`"That $${totalSpent.toFixed(0)} has appreciated in value - some of these are vintage now!"`)
      excuses.push(`"It's not spending, it's diversifying into the entertainment asset class."`)
    } else if (totalSpent > 500) {
      excuses.push(`"$${totalSpent.toFixed(0)} over ${Math.max(months, 1)} months? That's just $${(totalSpent/Math.max(months, 1)).toFixed(0)} per month - less than a gym membership!"`)
    } else {
      excuses.push(`"Only $${totalSpent.toFixed(0)} total - that's incredibly reasonable for a hobby!"`)
    }

    // Volume excuses
    if (gameCount > 100) {
      excuses.push(`"${gameCount} games gives me OPTIONS - I'm prepared for any mood or genre craving."`)
      excuses.push(`"Think of it as a personal Netflix for games - you pay for choice and convenience."`)
    } else if (gameCount > 50) {
      excuses.push(`"${gameCount} games ensures I'll never be bored - it's preventive entertainment."`)
    } else {
      excuses.push(`"${gameCount} games is actually quite modest - some people collect shoes!"`)
    }

    // Game age and curation excuses
    excuses.push(`"Most of these were on sale - I SAVED money on each purchase!"`)
    excuses.push(`"I'm supporting independent developers across multiple gaming eras."`)
    excuses.push(`"Gaming is my stress relief - it's cheaper than therapy!"`)
    excuses.push(`"At least I'm not spending money on microtransactions in one game."`)
    excuses.push(`"This collection represents ${Math.floor((acquisitionSpanDays || daysSince) / 365)} years of gaming evolution!"`)
    
    if (oldestGameName) {
      excuses.push(`"${oldestGameName} is like a vintage collectible now - I'm basically investing!"`)
    }
    
    if (years >= 3) {
      excuses.push(`"Some of these games are old enough to have their own sequels - it's gaming archaeology!"`)
    }
    
    if (daysSince >= 365) {
      excuses.push(`"This represents a curated timeline of gaming history - it's educational!"`)
    }

    return excuses
  }

  static getRandomPartnerExcuse(pile: PileEntry[]): string {
    const timeline = this.getPileTimeline(pile)
    return timeline.excuses[Math.floor(Math.random() * timeline.excuses.length)]
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