import { http, HttpResponse } from 'msw'

// Mock API base URL - should match your actual API URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Mock data
const mockUser = {
  id: 1,
  steam_id: '76561197960435530',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  shame_score: 150.0
}

const mockPileEntries = [
  {
    id: 1,
    status: 'unplayed',
    playtime_minutes: 0,
    purchase_price: 9.99,
    steam_game: {
      steam_app_id: 400,
      name: 'Portal',
      image_url: 'https://example.com/portal.jpg',
      price: 9.99,
      genres: ['Puzzle', 'Platformer'],
      description: 'A puzzle-platform game',
      developer: 'Valve Corporation',
      publisher: 'Valve Corporation',
      release_date: '2007-10-09',
      screenshots: [
        'https://example.com/screenshot1.jpg',
        'https://example.com/screenshot2.jpg'
      ],
      achievements_total: 15,
      metacritic_score: 90,
      positive_reviews: 50000,
      negative_reviews: 2000
    }
  },
  {
    id: 2,
    status: 'playing',
    playtime_minutes: 120,
    purchase_price: 19.99,
    steam_game: {
      steam_app_id: 420,
      name: 'Portal 2',
      image_url: 'https://example.com/portal2.jpg',
      price: 19.99,
      genres: ['Puzzle', 'Platformer'],
      description: 'The sequel to Portal',
      developer: 'Valve Corporation',
      publisher: 'Valve Corporation',
      release_date: '2011-04-18',
      screenshots: [
        'https://example.com/portal2-1.jpg',
        'https://example.com/portal2-2.jpg'
      ]
    }
  }
]

export const handlers = [
  // Auth endpoints
  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json(mockUser)
  }),

  // Pile endpoints
  http.get(`${API_BASE}/pile/`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filteredEntries = [...mockPileEntries]

    if (status) {
      filteredEntries = filteredEntries.filter(entry => entry.status === status)
    }

    const paginatedEntries = filteredEntries.slice(offset, offset + limit)

    return HttpResponse.json(paginatedEntries)
  }),

  http.post(`${API_BASE}/pile/import`, () => {
    return HttpResponse.json({
      message: 'Steam library import started',
      status: 'processing'
    })
  }),

  http.post(`${API_BASE}/pile/sync`, () => {
    return HttpResponse.json({
      message: 'Playtime sync started',
      status: 'processing'
    })
  }),

  http.post(`${API_BASE}/pile/amnesty/:gameId`, ({ params }) => {
    return HttpResponse.json({
      message: 'Amnesty granted',
      game_id: parseInt(params.gameId as string)
    })
  }),

  http.post(`${API_BASE}/pile/start-playing/:gameId`, ({ params }) => {
    return HttpResponse.json({
      message: 'Game marked as playing',
      game_id: parseInt(params.gameId as string)
    })
  }),

  http.post(`${API_BASE}/pile/complete/:gameId`, ({ params }) => {
    return HttpResponse.json({
      message: 'Game marked as completed',
      game_id: parseInt(params.gameId as string)
    })
  }),

  http.post(`${API_BASE}/pile/abandon/:gameId`, ({ params }) => {
    return HttpResponse.json({
      message: 'Game marked as abandoned',
      game_id: parseInt(params.gameId as string)
    })
  }),

  http.post(`${API_BASE}/pile/status/:gameId`, ({ params }) => {
    return HttpResponse.json({
      message: `Game status updated`,
      game_id: parseInt(params.gameId as string)
    })
  }),

  // Stats endpoints
  http.get(`${API_BASE}/stats/shame-score`, () => {
    return HttpResponse.json({
      total_score: 150.5,
      rank: 'Serial Buyer',
      breakdown: {
        unplayed_penalty: 40,
        money_wasted: 75.5,
        time_penalty: 30,
        zero_playtime_bonus: 15
      }
    })
  }),

  // Error handlers for testing error states
  http.get(`${API_BASE}/pile/error`, () => {
    return HttpResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }),

  http.post(`${API_BASE}/pile/unauthorized`, () => {
    return HttpResponse.json(
      { detail: 'Not authenticated' },
      { status: 401 }
    )
  }),
]