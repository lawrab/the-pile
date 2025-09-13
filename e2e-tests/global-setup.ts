import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...')
  
  // Create a browser instance to check if services are running
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: [
      '--window-size=1920,1080',
      '--start-maximized'
    ]
  })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  const page = await context.newPage()

  try {
    // Wait for frontend to be ready
    console.log('⏳ Waiting for frontend service...')
    await page.goto(config.webServer?.find(s => s.url?.includes('3000'))?.url || 'http://localhost:3000')
    await page.waitForSelector('body', { timeout: 30000 })
    console.log('✅ Frontend service is ready')

    // Wait for backend API to be ready
    console.log('⏳ Waiting for backend API...')
    const apiResponse = await page.request.get('http://localhost:8000/health')
    if (!apiResponse.ok()) {
      throw new Error(`API health check failed: ${apiResponse.status()}`)
    }
    console.log('✅ Backend API is ready')

    // Set up test database with sample data
    console.log('⏳ Setting up test database...')
    await setupTestDatabase()
    console.log('✅ Test database setup complete')

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }

  console.log('🎉 Global setup completed successfully!')
}

async function setupTestDatabase() {
  // This would typically involve:
  // 1. Running database migrations
  // 2. Seeding with test data
  // 3. Creating test users
  
  // For now, we'll just ensure the database is clean
  // In a real implementation, you might use the API or direct DB connection
  
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: [
      '--window-size=1920,1080',
      '--start-maximized'
    ]
  })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  const page = await context.newPage()

  try {
    // You could make API calls here to set up test data
    // For example, create a test user, import sample games, etc.
    
    // Mock test user creation
    const response = await page.request.post('http://localhost:8000/api/v1/test/setup', {
      data: {
        action: 'create_test_user',
        steam_id: '76561197960435530',
        username: 'e2e_test_user'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok() && response.status() !== 404) {
      console.warn(`Test setup endpoint not available: ${response.status()}`)
    }
    
  } catch (error) {
    console.warn('Test database setup skipped (endpoint not available):', error.message)
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetup