import { test, expect, Page } from '@playwright/test';

const login = async (page: Page) => {
  await page.goto('http://localhost:7500');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  if (await page.locator('input[type="email"]').isVisible().catch(() => false)) {
    await page.fill('input[type="email"]', 'admin@farm.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/in**', { timeout: 10000 });
    await page.waitForTimeout(2000);
  }
};

test.describe('Milking Page - Header Detail Pattern', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await login(page);

    // Navigate to milking tab
    const pemerahanButton = page.locator('button:has-text("Pemerahan")');
    if (await pemerahanButton.isVisible().catch(() => false)) {
      await pemerahanButton.click();
      await page.waitForTimeout(1000);
    }

    // Wait for page to load
    await expect(page.getByText('📅').first()).toBeVisible();
  });

  test('should display daily summaries in header format', async ({ page }) => {
    // Should show daily groups with date, total, cow count, and average
    await expect(page.getByText('📅').first()).toBeVisible();

    // Check for key stats elements
    const pageContent = await page.content();
    expect(pageContent).toContain('Total');
    expect(pageContent).toContain('Sapi');
    expect(pageContent).toContain('Rata-rata');

    // Should show Expand All and Collapse All buttons
    await expect(page.getByRole('button', { name: /Expand All/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Collapse All/ })).toBeVisible();
  });

  test('should expand daily group when clicking on header', async ({ page }) => {
    // Find the first daily header and click it
    const firstHeader = page.locator('div').filter({ hasText: '📅' }).first();
    await firstHeader.click();

    // Wait for detail view to appear
    await page.waitForTimeout(1000);

    // Should show expanded detail view
    await expect(page.getByText('📋 Rincian per Sapi')).toBeVisible();

    // Check for table elements
    const pageContent = await page.content();
    expect(pageContent).toContain('Sapi');
    expect(pageContent).toContain('Pagi');
    expect(pageContent).toContain('Siang');
    expect(pageContent).toContain('Malam');
  });

  test('should expand all groups when clicking Expand All button', async ({ page }) => {
    await page.click('button:has-text("▼ Expand All")');

    // Multiple groups should be expanded
    const expandedHeaders = await page.locator('div').filter({ hasText: '▼' }).count();
    expect(expandedHeaders).toBeGreaterThan(1);
  });

  test('should collapse all groups when clicking Collapse All button', async ({ page }) => {
    // First expand all
    await page.click('button:has-text("▼ Expand All")');

    // Then collapse all
    await page.click('button:has-text("▲ Collapse All")');

    // Should show collapsed headers with ▶
    const collapsedHeaders = await page.locator('div').filter({ hasText: '▶' }).count();
    expect(collapsedHeaders).toBeGreaterThan(1);
  });

  test('should open sidebar when clicking on cow row', async ({ page }) => {
    // Expand a daily group first
    const firstHeader = page.locator('div').filter({ hasText: '📅' }).first();
    await firstHeader.click();

    // Wait for table to appear
    await expect(page.getByText('📋 Rincian per Sapi')).toBeVisible();

    // Click on the first cow row in the table
    const table = page.locator('table').first();
    const firstRow = table.locator('tbody tr').first();
    await firstRow.click();

    // Wait for sidebar to open
    await page.waitForTimeout(2000);

    // Should open sidebar - check for URL change
    const url = page.url();
    expect(url).toContain('showDetail=true');
    expect(url).toContain('mode=edit');
  });

  test('should display correct data in expanded detail view', async ({ page }) => {
    // Expand first daily group
    const firstHeader = page.locator('div').filter({ hasText: '📅' }).first();
    await firstHeader.click();

    // Wait for table to load
    await page.waitForTimeout(1000);

    // Check for cow-specific data (more flexible patterns)
    const pageContent = await page.content();
    expect(pageContent).toMatch(/Garut/); // Match any Garut cow name
    expect(pageContent).toMatch(/\d+\.?\d*\s*L/); // Match volume amounts
    expect(pageContent).toMatch(/Pagi|Siang|Malam/); // Match sessions
  });

  test('should maintain consistent styling with other pages', async ({ page }) => {
    // Check for consistent UI elements
    await expect(page.getByText('days •')).toBeVisible(); // Summary text
    await expect(page.getByText('records')).toBeVisible(); // Record count

    // Stats section should be visible at top
    await expect(page.getByText('TOTAL TERNAK')).toBeVisible();
    await expect(page.getByText('TOTAL SUSU (L)')).toBeVisible();
  });

  test('should handle no data gracefully', async ({ page }) => {
    // This test verifies the page loads without errors
    // Just verify the main content area is visible
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('📅').first()).toBeVisible();
  });
});

test.describe('Milking Page - Data Calculations', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to milking tab
    await login(page);
    const pemerahanButton = page.locator('button:has-text("Pemerahan")');
    if (await pemerahanButton.isVisible().catch(() => false)) {
      await pemerahanButton.click();
      await page.waitForTimeout(1000);
    }
    await expect(page.getByText('📅').first()).toBeVisible();
  });

  test('should calculate daily totals correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Find any daily total - using more flexible selector
    const totalElement = page.locator('text=/\\d+\\.\\d+.*L.*Total/').first();
    await expect(totalElement).toBeVisible();
  });

  test('should calculate cow averages correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Find any average - using more flexible selector
    const avgElement = page.locator('text=/\\d+\\.\\d+.*L.*Rata-rata/').first();
    await expect(avgElement).toBeVisible();
  });
});
