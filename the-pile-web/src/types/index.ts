export interface User {
  id: number
  steam_id: string
  username: string
  avatar_url?: string
  shame_score: number
  deletion_requested_at?: string
  deletion_scheduled_at?: string
}

export interface Game {
  id: number
  steam_app_id: number
  name: string
  image_url?: string
  genres?: string[]
  categories?: string[]
  price?: number
  description?: string
  developer?: string
  publisher?: string
  release_date?: string
  steam_rating_percent?: number      // 0-100 positive review percentage
  steam_review_summary?: string      // "Very Positive", "Mixed", "Overwhelmingly Positive", etc.
  steam_review_count?: number        // Total number of reviews
  steam_type?: string               // 'game', 'dlc', 'demo', 'advertising', 'mod', 'video'
  rtime_last_played?: number         // Unix timestamp of when game was last played
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
  completion_date?: string
  abandon_date?: string
  abandon_reason?: string
  amnesty_date?: string
  amnesty_reason?: string
  created_at: string
  updated_at?: string
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

export interface ImportStatus {
  status: 'none' | 'running' | 'completed' | 'failed'
  operation_type?: 'import' | 'sync'
  progress_current: number
  progress_total: number
  error_message?: string
  started_at?: string
  completed_at?: string
  message?: string
}