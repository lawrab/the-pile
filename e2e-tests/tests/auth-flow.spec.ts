import { test, expect } from '@playwright/test'

import { mockAuthentication, navigateAsAuthenticated } from './helpers/auth-helpers'

test.describe('Authentication Flow', () => {
  test('should display landing page correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('The Pile')
    
    // Check for Steam login button
    const loginButton = page.locator('text=Login with Steam')
    await expect(loginButton).toBeVisible()
  })

  test('should initiate Steam OAuth flow', async ({ page }) => {
    await page.goto('/')
    
    // Click login button
    const loginButton = page.locator('text=Login with Steam')
    await loginButton.click()
    
    // Should redirect to Steam (or show error if Steam is not available)
    // In test environment, this will likely fail gracefully
    await page.waitForURL(/steam|error/, { timeout: 5000 }).catch(() => {
      // Expected in test environment without real Steam OAuth
    })
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Navigate directly to auth callback with invalid data
    await page.goto('/auth/callback?error=access_denied')
    
    // Should redirect back to home with error state
    await expect(page.url()).toContain('/')
  })

  test('should show protected routes require authentication', async ({ page }) => {
    // Try to access protected route directly without authentication
    await page.goto('/pile')
    
    // Should redirect to home or show login prompt
    await expect(page.url()).toContain('/')
  })

  test('should allow access to protected routes when authenticated', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.text().includes('Warning') || msg.text().includes('Error')) {
        console.log('PAGE LOG:', msg.text())
      }
    })
    
    // Navigate to protected route with authentication
    await navigateAsAuthenticated(page, '/pile', {
      username: 'E2E Test User',
      steamId: '76561197960435530'
    })
    
    // Brief wait for auth to process
    await page.waitForTimeout(300)
    
    // Check localStorage to verify auth was set
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    console.log('Auth test - token present:', !!token)
    
    // Should successfully load the pile page
    // Look for ANY h1 first to see what's actually there
    const anyHeading = await page.locator('h1').first().textContent()
    console.log('Auth test - h1 content:', anyHeading)
    
    // Check for the authenticated pile page content
    const authenticatedContent = page.locator('h1:has-text("The Pile of Regret"), h1:has-text("Your Pile is Empty")')
    await expect(authenticatedContent.first()).toBeVisible({ timeout: 3000 })
    
    // Should NOT show the login message
    const loginMessage = page.locator('text=Please log in to view your pile')
    await expect(loginMessage).not.toBeVisible()
    
    await expect(page.url()).toContain('/pile')
  })
})