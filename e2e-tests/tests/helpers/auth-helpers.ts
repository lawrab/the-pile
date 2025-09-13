import { Page } from '@playwright/test'

/**
 * Mock authentication by setting proper localStorage values
 * that match what the auth provider expects
 */
export async function mockAuthentication(page: Page, options: {
  steamId?: string
  username?: string
  avatarUrl?: string
} = {}) {
  const {
    steamId = '76561197960435530',
    username = 'E2E Test User',
    avatarUrl = 'https://avatars.steamstatic.com/test.jpg'
  } = options

  // FIRST: Set up API route mocks BEFORE page navigation
  // Mock auth endpoint with multiple patterns
  const authResponse = {
    steam_id: steamId,
    username: username,
    avatar_url: avatarUrl,
    shame_score: 42,
    last_sync_at: new Date().toISOString()
  }
  
  // Set up localStorage values that will be set on page navigation
  await page.addInitScript(({ steamId, username, avatarUrl }) => {
    // Set the auth token that the auth provider looks for
    localStorage.setItem('auth_token', 'mock-jwt-token-for-e2e-testing')
    
    // Store user profile data that might be used by other parts of the app
    localStorage.setItem('user', JSON.stringify({
      steam_id: steamId,
      username: username,
      avatar_url: avatarUrl,
      shame_score: 42,
      last_sync_at: new Date().toISOString()
    }))
  }, { steamId, username, avatarUrl })
  
  // Set up auth endpoint mocking - must be before navigation
  // The frontend actually calls http://localhost:8000/api/v1/auth/me
  await page.route('http://localhost:8000/api/v1/auth/me', route => {
    console.log('Auth API intercepted:', route.request().url())
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authResponse)
    })
  })
  
  // Also catch any other auth/me patterns just in case
  await page.route('**/auth/me', route => {
    console.log('Auth API (pattern) intercepted:', route.request().url())
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authResponse)
    })
  })

  // Mock the pile API to return some test data
  await page.route('http://localhost:8000/api/v1/pile/', route => {
    console.log('Pile API intercepted:', route.request().url())
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          status: 'unplayed',
          playtime_minutes: 0,
          purchase_price: 29.99,
          purchase_date: '2024-01-01T00:00:00Z',
          steam_game: {
            steam_app_id: 400,
            name: 'Portal',
            image_url: 'https://cdn.akamai.steamstatic.com/steam/apps/400/header.jpg',
            price: 9.99,
            genres: ['Puzzle', 'Platformer'],
            description: 'A mind-bending puzzle adventure.',
            developer: 'Valve Corporation',
            publisher: 'Valve Corporation',
            release_date: '2007-10-09',
            screenshots: [
              'https://cdn.akamai.steamstatic.com/steam/apps/400/ss_1.jpg',
              'https://cdn.akamai.steamstatic.com/steam/apps/400/ss_2.jpg'
            ],
            achievements_total: 15,
            metacritic_score: 90
          }
        },
        {
          id: 2,
          status: 'playing',
          playtime_minutes: 120,
          purchase_price: 59.99,
          purchase_date: '2024-02-01T00:00:00Z',
          steam_game: {
            steam_app_id: 1091500,
            name: 'Cyberpunk 2077',
            image_url: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
            price: 59.99,
            genres: ['RPG', 'Open World'],
            description: 'An open-world action-adventure story.',
            developer: 'CD PROJEKT RED',
            publisher: 'CD PROJEKT RED',
            release_date: '2020-12-10',
            screenshots: [
              'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_1.jpg'
            ],
            achievements_total: 44,
            metacritic_score: 86
          }
        }
      ])
    })
  })

  // Mock stats API endpoints
  await page.route('http://localhost:8000/api/v1/stats/**', route => {
    console.log('Stats API intercepted:', route.request().url())
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        shame_score: 42,
        total_games: 2,
        unplayed_games: 1,
        completion_rate: 0.5,
        money_wasted: 29.99,
        insights: {
          buying_patterns: ['Steam sales are your weakness'],
          genre_preferences: { 'Puzzle': 1, 'RPG': 1 },
          completion_rate: 0.5,
          most_neglected_genre: 'RPG',
          recommendations: ['Try finishing Cyberpunk 2077']
        }
      })
    })
  })
  
}

/**
 * Mock successful API responses for common operations
 */
export async function mockGameActions(page: Page) {
  // Mock amnesty granting
  await page.route('http://localhost:8000/api/v1/pile/amnesty/**', route => {
    console.log('Amnesty API intercepted:', route.request().url())
    route.fulfill({ 
      status: 200, 
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Amnesty granted' })
    })
  })

  // Mock status updates
  await page.route('http://localhost:8000/api/v1/pile/status/**', route => {
    console.log('Status API intercepted:', route.request().url())
    route.fulfill({ 
      status: 200, 
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Status updated' })
    })
  })
  
  // Mock pile complete endpoint
  await page.route('http://localhost:8000/api/v1/pile/complete/**', route => {
    console.log('Complete API intercepted:', route.request().url())
    route.fulfill({ 
      status: 200, 
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Game marked as completed' })
    })
  })

  // Mock Steam import
  await page.route('http://localhost:8000/api/v1/pile/import', route => {
    console.log('Import API intercepted:', route.request().url())
    route.fulfill({ 
      status: 200, 
      contentType: 'application/json',
      body: JSON.stringify({ 
        message: "Import completed", 
        games_imported: 5, 
        games_updated: 2 
      })
    })
  })
}

/**
 * Navigate to a protected route with authentication
 */
export async function navigateAsAuthenticated(page: Page, path: string, options?: {
  steamId?: string
  username?: string
  avatarUrl?: string
}) {
  // Set up all mocks BEFORE navigation
  await mockAuthentication(page, options)
  await mockGameActions(page)
  
  // Navigate to the page - the addInitScript will run during navigation
  await page.goto(path)
  
  // Wait briefly for React and auth provider to process
  await page.waitForTimeout(200)
  
  // Double-check localStorage was set
  const token = await page.evaluate(() => localStorage.getItem('auth_token'))
  if (!token) {
    console.error('Warning: auth_token not set in localStorage after navigation')
  }
}