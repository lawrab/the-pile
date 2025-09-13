import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in parallel when headless, sequentially when headed */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use multiple workers for better performance */
  workers: process.env.CI ? 2 : '50%',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Run headless by default (set to false to see browser) */
    headless: true,
    
    /* Slow down actions to make them more visible */
    launchOptions: {
      slowMo: 500, // 500ms delay between actions
    },
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video for all tests to see what happened */
    video: 'on',
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-visual',
      use: { 
        ...devices['Desktop Chrome'],
        /* Hyprland-friendly settings for better visibility */
        viewport: { width: 1920, height: 1080 },
        /* Keep browser open after tests finish for inspection */
        launchOptions: {
          slowMo: 500,
          /* Use system Chromium as fallback if playwright-driver.browsers fails */
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          /* Hyprland-specific browser arguments */
          args: [
            '--window-size=1920,1080',
            '--window-position=0,0',
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--no-default-browser-check',
            '--disable-default-apps',
          ],
          /* Uncomment to keep browser open after tests */
          // devtools: true,
        }
      },
    },

    /* Other browsers commented out - uncomment to run cross-browser tests */
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd ../the-pile-web && npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../the-pile-api && source venv/bin/activate && python dev.py',
      url: 'http://localhost:8000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],

  /* Global setup to prepare test data */
  globalSetup: './global-setup.ts',

  /* Global teardown to cleanup */
  globalTeardown: './global-teardown.ts',

  /* Expect timeout for assertions */
  expect: {
    timeout: 3 * 1000,  // Reduced from 10s to 3s
  },

  /* Test timeout */
  timeout: 10 * 1000,  // Reduced from 60s to 10s
})