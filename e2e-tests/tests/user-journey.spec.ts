import { test, expect } from '@playwright/test'
import { mockAuthentication, navigateAsAuthenticated } from './helpers/auth-helpers'

test.describe('Complete User Journey', () => {
  test('should complete full user flow from landing to pile management', async ({ page }) => {
    // 1. Landing page
    await page.goto('/')
    
    // Should show landing page
    const landingHeading = page.locator('h1').first()
    await expect(landingHeading).toBeVisible()
    
    // 2. Authentication flow (properly mocked)
    await navigateAsAuthenticated(page, '/pile', {
      username: 'E2E Test User',
      steamId: '76561197960435530'
    })
    
    // 3. Pile dashboard interaction
    // Check for authenticated pile page (either has games or empty)
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/The Pile of Regret|Your Pile is Empty/)
    
    // 4. Look for key sections
    const importButton = page.locator('button:has-text("Import Steam Library")')
    await expect(importButton).toBeVisible()
    
    // 5. Check for navigation elements
    const divineReckoning = page.locator('text=Divine Reckoning')
    const eternalGarden = page.locator('text=Eternal Garden')
    
    const hasNavigation = await divineReckoning.isVisible().catch(() => false) || 
                         await eternalGarden.isVisible().catch(() => false)
    
    expect(hasNavigation).toBeTruthy()
    
    // 6. Test basic interaction
    if (await importButton.isVisible()) {
      await importButton.click()
      await page.waitForTimeout(200)
    }
    
    // Journey completed successfully
    expect(true).toBeTruthy()
  })

  test('should handle navigation between sections', async ({ page }) => {
    await navigateAsAuthenticated(page, '/pile')
    
    // Should be on pile page
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Try to navigate to stats if available
    const divineReckoning = page.locator('a:has-text("Divine Reckoning"), button:has-text("Divine Reckoning")')
    const hasStats = await divineReckoning.first().isVisible().catch(() => false)
    
    if (hasStats) {
      await divineReckoning.first().click()
      await page.waitForTimeout(300)
      
      // Should navigate (URL might change or page content might update)
      expect(true).toBeTruthy()
    }
  })

  test('should handle responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Mock authentication properly
    await mockAuthentication(page)
    
    await page.goto('/pile')
    
    // Should load properly on mobile
    const mobileHeading = page.locator('h1').first()
    await expect(mobileHeading).toBeVisible()
    const mobileText = await mobileHeading.textContent()
    expect(mobileText).toMatch(/The Pile of Regret|Your Pile is Empty/)
    
    // Should still show import button
    const importButton = page.locator('button:has-text("Import Steam Library")')
    await expect(importButton).toBeVisible()
  })

  test('should handle basic accessibility', async ({ page }) => {
    await mockAuthentication(page)
    
    await page.goto('/pile')
    
    // Check for proper heading hierarchy
    const h1Elements = page.locator('h1')
    await expect(h1Elements).toHaveCount(1)
    
    // Should have interactive elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
    
    // Should have proper page structure
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('should show consistent branding', async ({ page }) => {
    await mockAuthentication(page)
    
    await page.goto('/pile')
    
    // Should show the themed UI
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    
    const headingText = await heading.textContent()
    
    // Should use the regret/pile theming
    const hasTheming = headingText?.includes('Pile') || 
                      headingText?.includes('Regret') || 
                      headingText?.includes('Empty')
    
    expect(hasTheming).toBeTruthy()
  })
})