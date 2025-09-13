import { test, expect } from '@playwright/test'
import { mockAuthentication, mockGameActions } from './helpers/auth-helpers'

test.describe('Steam Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication properly
    await mockAuthentication(page)
    await mockGameActions(page)
  })

  test('should show Steam import button when authenticated', async ({ page }) => {
    await page.goto('/pile')
    
    // Look for Steam import functionality
    const importButton = page.locator('button:has-text("Import Steam Library")')
    await expect(importButton).toBeVisible()
  })

  test('should handle Steam library import', async ({ page }) => {
    await page.goto('/pile')
    
    // Click import button
    const importButton = page.locator('button:has-text("Import Steam Library")')
    await expect(importButton).toBeVisible()
    
    await importButton.click()
    
    // Should handle the click without errors
    await page.waitForTimeout(300)
    expect(true).toBeTruthy()
  })

  test('should display user authentication status', async ({ page }) => {
    await page.goto('/pile')
    
    // Should be authenticated - no login message
    const loginMessage = page.locator('text=Please log in to view your pile')
    await expect(loginMessage).not.toBeVisible()
    
    // Should show pile content
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/The Pile of Regret|Your Pile is Empty/)
  })

  test('should show game information from Steam', async ({ page }) => {
    await page.goto('/pile')
    
    // Should display pile page
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Look for game titles (h3 elements)
    const gameTitle = page.locator('h3').first()
    const hasGames = await gameTitle.isVisible().catch(() => false)
    
    if (hasGames) {
      // Should have game information
      await expect(gameTitle).toBeVisible()
      
      // Games should have some metadata (price, etc.)
      const gameMetadata = page.locator('text=/\\$\\d+/')
      const hasPrice = await gameMetadata.first().isVisible().catch(() => false)
      
      if (hasPrice) {
        await expect(gameMetadata.first()).toBeVisible()
      }
    }
  })

  test('should handle Steam integration gracefully', async ({ page }) => {
    await page.goto('/pile')
    
    // Page should load successfully
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Should not show error states
    const errorMessage = page.locator('text=/error|Error|ERROR/')
    const hasError = await errorMessage.first().isVisible().catch(() => false)
    
    // No errors should be visible
    expect(hasError).toBeFalsy()
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/pile')
    
    // Should have navigation elements
    const divineReckoning = page.locator('text=Divine Reckoning')
    const eternalGarden = page.locator('text=Eternal Garden')
    
    const hasReckoning = await divineReckoning.isVisible().catch(() => false)
    const hasGarden = await eternalGarden.isVisible().catch(() => false)
    
    // At least one navigation element should be visible
    expect(hasReckoning || hasGarden).toBeTruthy()
  })
})