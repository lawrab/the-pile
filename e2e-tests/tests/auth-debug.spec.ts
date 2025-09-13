import { test, expect } from '@playwright/test'
import { mockAuthentication, navigateAsAuthenticated } from './helpers/auth-helpers'

test.describe('Authentication Debug', () => {
  test('debug authentication step by step', async ({ page }) => {
    // Enable console logs to see our debug output
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
    
    console.log('Step 1: Setting up authentication mock')
    await mockAuthentication(page, {
      username: 'Debug User',
      steamId: '76561197960435530'
    })
    
    console.log('Step 2: Going to pile page')
    await page.goto('/pile')
    
    console.log('Step 3: Waiting for page to load')
    await page.waitForTimeout(500)
    
    // Check what's in localStorage
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    const user = await page.evaluate(() => localStorage.getItem('user'))
    console.log('LocalStorage token:', token)
    console.log('LocalStorage user:', user)
    
    // Check if we see the login message or the pile
    const loginMessage = page.locator('text=Please log in to view your pile')
    const pileHeader = page.locator('h1:has-text("The Pile of Regret"), h1:has-text("Your Pile is Empty")')
    
    const hasLoginMessage = await loginMessage.isVisible({ timeout: 1000 }).catch(() => false)
    const hasPileHeader = await pileHeader.first().isVisible({ timeout: 1000 }).catch(() => false)
    
    console.log('Has login message:', hasLoginMessage)
    console.log('Has pile header:', hasPileHeader)
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'auth-debug.png', fullPage: true })
    
    // Expect authentication to work - should show pile page not login message
    await expect(pileHeader.first()).toBeVisible({ timeout: 5000 })
    await expect(loginMessage).not.toBeVisible()
  })

  test('debug with navigateAsAuthenticated helper', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
    
    console.log('Using navigateAsAuthenticated helper')
    await navigateAsAuthenticated(page, '/pile', {
      username: 'Debug User 2',
      steamId: '76561197960435530'
    })
    
    // Check localStorage again
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    const user = await page.evaluate(() => localStorage.getItem('user'))
    console.log('LocalStorage token:', token)
    console.log('LocalStorage user:', user)
    
    await page.screenshot({ path: 'auth-debug-2.png', fullPage: true })
    
    // Should show authenticated pile page
    const pileHeader = page.locator('h1:has-text("The Pile of Regret"), h1:has-text("Your Pile is Empty")')
    await expect(pileHeader.first()).toBeVisible({ timeout: 5000 })
  })
})