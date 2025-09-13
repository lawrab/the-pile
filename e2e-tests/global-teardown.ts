import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...')

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
    // Clean up test data
    console.log('⏳ Cleaning up test database...')
    await cleanupTestDatabase(page)
    console.log('✅ Test database cleanup complete')

  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw here, as we don't want to fail tests due to cleanup issues
  } finally {
    await context.close()
    await browser.close()
  }

  console.log('🎉 Global teardown completed!')
}

async function cleanupTestDatabase(page: any) {
  try {
    // Clean up test data
    const response = await page.request.post('http://localhost:8000/api/v1/test/cleanup', {
      data: {
        action: 'cleanup_test_data'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok() && response.status() !== 404) {
      console.warn(`Test cleanup endpoint returned: ${response.status()}`)
    }
    
  } catch (error) {
    console.warn('Test database cleanup skipped (endpoint not available):', error.message)
  }
}

export default globalTeardown