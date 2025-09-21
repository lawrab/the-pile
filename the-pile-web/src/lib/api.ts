import axios from 'axios'
import type { User, PileEntry, RealityCheck, ShameScore, BehavioralInsights, ShareableStats } from '@/types'
import { authEvents } from './auth-events'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
})

// Simple response interceptor for logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log authentication errors for debugging
    if (error.response?.status === 401) {
      console.log('API call failed: 401 Unauthorized')
    }
    
    return Promise.reject(error)
  }
)

export const authApi = {
  getSteamLoginUrl: () => api.get<{ auth_url: string }>('/auth/steam/login'),
  getCurrentUser: () => api.get<User>('/auth/me'),
  requestAccountDeletion: () => api.delete('/auth/profile'),
  cancelAccountDeletion: () => api.post('/auth/profile/cancel-deletion'),
}

export const pileApi = {
  getPile: (params?: {
    status?: string
    genre?: string
    sort_by?: string
    sort_direction?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }) => api.get<PileEntry[]>('/pile/', { params }),
  
  importSteamLibrary: () => api.post('/pile/import'),
  syncPlaytime: () => api.post('/pile/sync'),
  clearPile: () => api.delete('/pile/clear'),
  getImportStatus: () => api.get('/pile/import/status'),
  
  // Game status change endpoints
  grantAmnesty: (gameId: string | number, reason: string) => 
    api.post(`/pile/amnesty/${gameId}`, { reason }),
  startPlaying: (gameId: string | number) => 
    api.post(`/pile/start-playing/${gameId}`),
  markCompleted: (gameId: string | number) => 
    api.post(`/pile/complete/${gameId}`),
  markAbandoned: (gameId: string | number, reason?: string) => 
    api.post(`/pile/abandon/${gameId}`, { reason }),
  updateStatus: (gameId: string | number, status: 'unplayed' | 'playing' | 'completed' | 'abandoned' | 'amnesty_granted') => 
    api.post(`/pile/status/${gameId}`, { status }),
}

export const statsApi = {
  getRealityCheck: () => api.get<RealityCheck>('/stats/reality-check'),
  getShameScore: () => api.get<ShameScore>('/stats/shame-score'),
  getInsights: () => api.get<BehavioralInsights>('/stats/insights'),
}

export const shareApi = {
  createShareableStats: () => api.post<{ share_id: string; image_url: string; text_stats: ShareableStats }>('/share/create'),
  getSharedStats: (shareId: string) => api.get<ShareableStats>(`/share/${shareId}`),
}

export { api }