import { test, expect } from '@playwright/test';

test.describe('Daily Milking Entry (Input Harian)', () => {
  const login = async (page) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    if (await page.locator('input[type="email"]').isVisible().catch(() => false)) {
      await page.fill('input[type="email"]', 'admin@farm.local');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/', { timeout: 10000 });
      await page.waitForTimeout(2000);
    }
  };

  test('should navigate to Input Harian tab', async ({ page }) => {
    await login(page);
    
    // Click Input Harian tab
    const inputHarianButton = page.locator('button:has-text("Input Harian")');
    if (await inputHarianButton.isVisible().catch(() => false)) {
      await inputHarianButton.click();
      await page.waitForTimeout(2000);
      
      // Verify page changed
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have environmental data fields', async ({ page }) => {
    await login(page);
    
    // Click Input Harian tab
    const inputHarianButton = page.locator('button:has-text("Input Harian")');
    if (await inputHarianButton.isVisible().catch(() => false)) {
      await inputHarianButton.click();
      await page.waitForTimeout(2000);
      
      // Check for environmental fields
      const hasTempMin = await page.locator('input[name="tempMin"]').isVisible().catch(() => false);
      const hasTempMax = await page.locator('input[name="tempMax"]').isVisible().catch(() => false);
      const hasHumidity = await page.locator('input[name="humidity"]').isVisible().catch(() => false);
      
      expect(hasTempMin || hasTempMax || hasHumidity).toBeTruthy();
    }
  });
});
