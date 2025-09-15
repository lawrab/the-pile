/**
 * Humor constants and rotating text for The Pile
 * Centralized location for all humorous and rotating content
 */

// Shame level rankings based on score ranges
export const SHAME_RANKINGS = [
  { min: 0, max: 50, level: "Innocent", description: "A reasonable relationship with your backlog" },
  { min: 50, max: 100, level: "Casual Collector", description: "You like having options 'just in case'" },
  { min: 100, max: 200, level: "Serial Buyer", description: "Steam sales are your weakness" },
  { min: 200, max: 400, level: "Pile Builder", description: "Your backlog has achieved structural integrity" },
  { min: 400, max: Infinity, level: "The Pile Master", description: "Your pile is visible from space" }
]

// Taglines and subtitles (rotate randomly)
export const TAGLINES = [
  "The brutally honest Steam backlog tracker that turns your shame into insights",
  "Face your digital hoarding habits with data-driven honesty",
  "Your Steam library's confession booth",
  "Where unplayed games go to be acknowledged",
  "Quantifying gaming guilt since 2024"
]

// Motivational/humorous messages for different contexts
export const PILE_MESSAGES = {
  empty: [
    "Your pile is empty. Are you even a real gamer?",
    "No backlog? That's suspicious...",
    "A clean pile. Almost too clean."
  ],
  small: [
    "A manageable pile. There's still hope.",
    "You can actually finish these... probably.",
    "Not bad! You might see the end of this."
  ],
  medium: [
    "The pile grows. The guilt deepens.",
    "Starting to look like a real collection.",
    "You're entering dangerous territory."
  ],
  large: [
    "Your pile has achieved critical mass.",
    "Even Steam is worried about you.",
    "This is no longer a backlog, it's a lifestyle."
  ],
  massive: [
    "Your pile needs its own zip code.",
    "Archaeologists will study this someday.",
    "You've transcended mere collecting."
  ]
}

// Amnesty reasons (for random suggestions)
export const AMNESTY_REASONS = [
  "It was on sale and I was weak",
  "Looked good in 2015",
  "Friend said it was amazing (they lied)",
  "Bundle filler - never wanted it",
  "The reviews were misleading",
  "My tastes have evolved",
  "Life's too short for this",
  "Making room for games I'll actually play",
  "Spring cleaning (in December)",
  "Accepting who I really am"
]

// Pattern detection insights
export const BEHAVIORAL_INSIGHTS = {
  saleAddict: [
    "You buy {percentage}% of your games during sales",
    "Steam sales trigger your fight-or-buy response",
    "Your wallet cries during every seasonal sale"
  ],
  genreHoarder: [
    "You buy {genre} games but rarely play them",
    "Your {genre} completion rate is {rate}%",
    "{count} {genre} games remain untouched"
  ],
  serialStarter: [
    "You've started {count} games but finished {finished}",
    "Your completion rate suggests commitment issues",
    "You have a pattern of 2-hour abandonment"
  ],
  patientGamer: [
    "You buy games years after release",
    "Your average purchase is {years} years post-launch",
    "Patient gaming or procrastination?"
  ]
}

// Time estimation messages
export const TIME_MESSAGES = {
  reasonable: [
    "{time} hours - totally doable!",
    "Only {time} hours to freedom",
    "{time} hours of adventure await"
  ],
  challenging: [
    "{time} hours - better get started",
    "{time} hours - hope you're immortal",
    "{time} hours - see you in {years} years"
  ],
  impossible: [
    "{time} hours - mathematically impossible",
    "{time} hours - even AI can't help you",
    "{time} hours - your grandchildren might finish"
  ]
}

// Loading messages
export const LOADING_MESSAGES = [
  "Calculating your shame...",
  "Judging your choices...",
  "Counting unplayed games...",
  "Measuring the pile...",
  "Importing questionable decisions...",
  "Analyzing buying patterns...",
  "Quantifying regret..."
]

// Error messages with humor
export const ERROR_MESSAGES = {
  steamDown: "Steam is down. Even they need a break from your library.",
  importFailed: "Import failed. Your pile was too heavy.",
  networkError: "Connection lost. The pile remains.",
  unauthorized: "Please log in to face your shame.",
  rateLimit: "Slow down! Even confession needs pacing."
}

// Achievement-style messages for milestones
export const MILESTONES = {
  firstAmnesty: "First Amnesty - The healing begins",
  tenAmnesty: "Serial Forgiver - 10 games released",
  hundredGames: "Collector - 100 game milestone",
  thousandGames: "Digital Dragon - Hoarding level 1000",
  zeroBacklog: "The Impossible - Backlog cleared",
  oneYearMember: "Pile Veteran - One year of honesty"
}

// CTA (Call-to-action) variations
export const CTA_TEXTS = {
  login: [
    "Start Your Confession",
    "Face The Pile",
    "Begin the Reckoning",
    "Confront Your Library",
    "Login with Steam"
  ],
  amnesty: [
    "Grant Amnesty",
    "Let It Go",
    "Release This Game",
    "Set It Free",
    "Time to Move On"
  ],
  analyze: [
    "Analyze My Shame",
    "Calculate the Damage",
    "Show Me the Truth",
    "Reveal My Patterns",
    "Quantify My Guilt"
  ]
}

// Stats descriptions
export const STAT_DESCRIPTIONS = {
  shameScore: "Your quantified digital guilt",
  unplayedCount: "Games you'll never touch",
  moneyWasted: "Investment in false hope",
  timeNeeded: "Hours until freedom",
  completionRate: "Your follow-through percentage",
  avgPlaytime: "Average before abandonment",
  oldestUnplayed: "Your most patient purchase"
}

// Helper function to get random item from array
export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

// Helper function to get shame ranking
export function getShameRanking(score: number) {
  return SHAME_RANKINGS.find(rank => score >= rank.min && score < rank.max) || SHAME_RANKINGS[SHAME_RANKINGS.length - 1]
}

// Helper function to format insight with variables
export function formatInsight(template: string, variables: Record<string, any>): string {
  return template.replace(/{(\w+)}/g, (match, key) => variables[key] || match)
}