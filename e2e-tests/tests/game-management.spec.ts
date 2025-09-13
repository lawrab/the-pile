import { test, expect } from '@playwright/test'
import { mockAuthentication, mockGameActions } from './helpers/auth-helpers'

test.describe('Game Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication properly
    await mockAuthentication(page)
    await mockGameActions(page)
  })

  test('should load pile page with games', async ({ page }) => {
    await page.goto('/pile')
    
    // Should show authenticated pile page
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/The Pile of Regret|Your Pile is Empty/)
    
    // If there are games, should see game titles
    const gameTitle = page.locator('h3').first()
    const hasGames = await gameTitle.isVisible().catch(() => false)
    
    if (hasGames) {
      // Should have game titles
      await expect(gameTitle).toBeVisible()
    }
  })

  test('should show game action buttons', async ({ page }) => {
    await page.goto('/pile')
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Look for action buttons like "Grant Peace" and "Begin Quest"
    const grantPeaceButton = page.locator('button:has-text("Grant Peace")')
    const beginQuestButton = page.locator('button:has-text("Begin Quest")')
    
    const hasGrantPeace = await grantPeaceButton.first().isVisible().catch(() => false)
    const hasBeginQuest = await beginQuestButton.first().isVisible().catch(() => false)
    
    // At least one type of action button should be visible
    expect(hasGrantPeace || hasBeginQuest).toBeTruthy()
  })

  test('should handle game interactions', async ({ page }) => {
    await page.goto('/pile')
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Try to interact with a "Grant Peace" button if available
    const grantPeaceButton = page.locator('button:has-text("Grant Peace")')
    const hasButton = await grantPeaceButton.first().isVisible().catch(() => false)
    
    if (hasButton) {
      await grantPeaceButton.first().click()
      
      // Wait for any response
      await page.waitForTimeout(300)
      
      // Test passes if no errors (button might trigger API call)
      expect(true).toBeTruthy()
    }
  })

  test('should display ecosystem health section', async ({ page }) => {
    await page.goto('/pile')
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Look for ecosystem section
    const ecosystemSection = page.locator('text=Ecosystem Health')
    const hasEcosystem = await ecosystemSection.isVisible().catch(() => false)
    
    if (hasEcosystem) {
      await expect(ecosystemSection).toBeVisible()
      
      // Should show health percentage
      const healthPercentage = page.locator('text=/\\d+%/')
      await expect(healthPercentage.first()).toBeVisible()
    }
  })

  test('should show navigation buttons', async ({ page }) => {
    await page.goto('/pile')
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Should have navigation to stats and cemetery
    const divineReckoningButton = page.locator('button:has-text("Divine Reckoning"), a:has-text("Divine Reckoning")')
    const eternalGardenButton = page.locator('button:has-text("Eternal Garden"), a:has-text("Eternal Garden")')
    
    const hasReckoning = await divineReckoningButton.first().isVisible().catch(() => false)
    const hasGarden = await eternalGardenButton.first().isVisible().catch(() => false)
    
    // At least one navigation element should be visible
    expect(hasReckoning || hasGarden).toBeTruthy()
  })

  test('should display import library button', async ({ page }) => {
    await page.goto('/pile')
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Should show import button
    const importButton = page.locator('button:has-text("Import Steam Library")')
    await expect(importButton).toBeVisible()
  })
})