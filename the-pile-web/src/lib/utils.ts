import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
  if (score < 50) {
    return {
      level: "Innocent",
      color: "text-green-400",
      description: "You have a reasonable relationship with your backlog"
    }
  } else if (score < 100) {
    return {
      level: "Casual Collector",
      color: "text-yellow-400", 
      description: "You like to buy games 'just in case'"
    }
  } else if (score < 200) {
    return {
      level: "Serial Buyer",
      color: "text-orange-400",
      description: "Sales are your weakness"
    }
  } else if (score < 400) {
    return {
      level: "Pile Builder",
      color: "text-red-400",
      description: "Your backlog has achieved structural integrity"
    }
  } else {
    return {
      level: "The Pile Master",
      color: "text-purple-400",
      description: "Your backlog could be seen from space"
    }
  }
}

export function getRandomShameMessage(score: number): string {
  const messages = [
    "Even Steam is worried about you.",
    "Your pile has its own weather system.",
    "Archaeologists want to excavate your backlog.",
    "Your unplayed games are filing for abandonment.",
    "The Smithsonian wants to display your pile.",
    "Your backlog qualifies as a geological formation.",
    "NASA can see your pile from the International Space Station.",
    "Your pile has developed its own ecosystem.",
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
}