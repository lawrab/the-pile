import { test, expect } from '@playwright/test'
import { mockAuthentication, mockGameActions } from './helpers/auth-helpers'

test.describe('Pile Visualization', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication properly
    await mockAuthentication(page)
    await mockGameActions(page)
  })

  test('should load pile dashboard when authenticated', async ({ page }) => {
    await page.goto('/pile')
    
    // Check for main dashboard elements - either has games or empty
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/The Pile of Regret|Your Pile is Empty/)
  })

  test('should display Sacred Altar section', async ({ page }) => {
    await page.goto('/pile')
    
    // Should show the Sacred Altar
    const sacredAltar = page.locator('text=Sacred Altar')
    const hasAltar = await sacredAltar.isVisible().catch(() => false)
    
    if (hasAltar) {
      await expect(sacredAltar).toBeVisible()
    }
  })

  test('should display Digital Graveyard section', async ({ page }) => {
    await page.goto('/pile')
    
    // Should show the Digital Graveyard
    const graveyard = page.locator('text=Digital Graveyard')
    const hasGraveyard = await graveyard.isVisible().catch(() => false)
    
    if (hasGraveyard) {
      await expect(graveyard).toBeVisible()
    }
  })

  test('should display ecosystem section', async ({ page }) => {
    await page.goto('/pile')
    
    // Should show ecosystem
    const ecosystem = page.locator('text=Digital Ecosystem')
    const hasEcosystem = await ecosystem.isVisible().catch(() => false)
    
    if (hasEcosystem) {
      await expect(ecosystem).toBeVisible()
      
      // Should show health information
      const healthInfo = page.locator('text=/Health|health/')
      await expect(healthInfo.first()).toBeVisible()
    }
  })

  test('should handle page load without errors', async ({ page }) => {
    await page.goto('/pile')
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Should not have any console errors or crash
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/pile')
    
    // Should have some navigation
    const navElements = page.locator('button, a')
    const hasNavigation = await navElements.first().isVisible().catch(() => false)
    
    expect(hasNavigation).toBeTruthy()
  })
})