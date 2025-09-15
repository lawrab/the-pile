import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getShameRanking, PILE_MESSAGES, getRandomItem } from './humor-constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatPlaytime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
}

export function calculateShameLevel(score: number): {
  level: string
  color: string
  description: string
} {
  const ranking = getShameRanking(score)
  
  // Map ranking levels to colors
  const colorMap: Record<string, string> = {
    "Innocent": "text-green-400",
    "Casual Collector": "text-yellow-400",
    "Serial Buyer": "text-orange-400",
    "Pile Builder": "text-red-400",
    "The Pile Master": "text-purple-400"
  }
  
  return {
    level: ranking.level,
    color: colorMap[ranking.level] || "text-slate-400",
    description: ranking.description
  }
}

export function getRandomShameMessage(score: number): string {
  // Determine pile size category based on score
  let category: keyof typeof PILE_MESSAGES
  
  if (score === 0) {
    category = 'empty'
  } else if (score < 50) {
    category = 'small'
  } else if (score < 100) {
    category = 'medium'
  } else if (score < 200) {
    category = 'large'
  } else {
    category = 'massive'
  }
  
  return getRandomItem(PILE_MESSAGES[category])
}