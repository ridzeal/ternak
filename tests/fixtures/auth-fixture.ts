import { test as base, expect, Page } from '@playwright/test';

/**
 * Test fixtures for Ternak application with authentication
 */

export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }: { page: Page }, use: (r: Page) => Promise<void>) => {
    // Login before each test
    await page.goto('/login');
    
    // Wait for login form
    await page.waitForSelector('input[type="email"], input[type="text"]');
    
    // Fill credentials (default admin user from seed)
    await page.fill('input[type="email"]', 'admin@farm.local');
    await page.fill('input[type="password"]', 'admin123');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to home
    await page.waitForURL('**/', { timeout: 10000 });
    
    // Wait for page to load - look for any main content
    await page.waitForSelector('text=Ternak, text=Registri, text=🐄', { timeout: 10000 }).catch(() => {
      // Fallback: just wait for the page to be ready
      page.waitForLoadState('networkidle', { timeout: 5000 });
    });
    
    await use(page);
  },
});

export { expect };
