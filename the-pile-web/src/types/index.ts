export interface User {
  id: number
  steam_id: string
  username: string
  avatar_url?: string
  shame_score: number
}

export interface Game {
  id: number
  steam_app_id: number
  name: string
  image_url?: string
  genres?: string[]
  price?: number
  description?: string
  developer?: string
  publisher?: string
  release_date?: string
}

export enum GameStatus {
  UNPLAYED = 'unplayed',
  PLAYING = 'playing', 
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  AMNESTY_GRANTED = 'amnesty_granted'
}

export interface PileEntry {
  id: number
  status: GameStatus
  playtime_minutes: number
  purchase_date?: string
  purchase_price?: number
  amnesty_date?: string
  amnesty_reason?: string
  steam_game: Game
}

export interface RealityCheck {
  total_games: number
  unplayed_games: number
  completion_years: number
  money_wasted: number
  most_expensive_unplayed: Record<string, number>
  oldest_unplayed: Record<string, string>
}

export interface ShameScore {
  score: number
  breakdown: Record<string, number>
  rank: string
  message: string
}

export interface BehavioralInsights {
  buying_patterns: string[]
  genre_preferences: Record<string, number>
  completion_rate: number
  most_neglected_genre: string
  recommendations: string[]
}

export interface ShareableStats {
  username: string
  shame_score: number
  total_games: number
  unplayed_games: number
  money_wasted: number
  completion_years: number
  fun_fact: string
}