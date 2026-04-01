import { test, expect } from '@playwright/test';

test.describe('Ternak (Herd) Management', () => {
  const baseURL = 'http://localhost:7500';
  const createdCowTags: string[] = [];

  // Cleanup after all tests
  test.afterAll(async ({ request }) => {
    // Get all cows and delete test cows
    const cowsResponse = await request.get(`${baseURL}/api/cows`);
    if (cowsResponse.ok()) {
      const cows = await cowsResponse.json();
      for (const tag of createdCowTags) {
        const cow = cows.find((c: any) => c.tag === tag);
        if (cow) {
          try {
            await request.delete(`${baseURL}/api/cows?id=${cow.id}`);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }
  });

  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load (it will redirect to login if not authenticated)
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Either we're on login page or home page
    const url = page.url();
    if (url.includes('/login')) {
      // Login
      await page.fill('input[type="email"]', 'admin@farm.local');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/in**', { timeout: 10000 });
    }

    // Verify page loaded with some content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display navigation tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Login if needed
    if (await page.locator('input[type="email"]').isVisible().catch(() => false)) {
      await page.fill('input[type="email"]', 'admin@farm.local');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/in**', { timeout: 10000 });
    }

    // Check for navigation - look for any tab text
    const navTexts = ['Ternak', 'Pemerahan', 'Input Harian', 'Laporan', 'Kegiatan'];
    let foundNav = false;

    for (const text of navTexts) {
      const locator = page.locator(`text=${text}`);
      if (await locator.isVisible().catch(() => false)) {
        foundNav = true;
        break;
      }
    }

    expect(foundNav).toBeTruthy();
  });

  test('should add and cleanup cow', async ({ page, request }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Login if needed
    if (await page.locator('input[type="email"]').isVisible().catch(() => false)) {
      await page.fill('input[type="email"]', 'admin@farm.local');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/in**', { timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    const uniqueTag = `TEST-${Date.now()}`;
    createdCowTags.push(uniqueTag);

    // Find and click add cow button
    const addButtons = ['Daftarkan Sapi', 'Tambah Ternak', '+ Tambah'];
    let clicked = false;

    for (const text of addButtons) {
      const button = page.locator(`button:has-text("${text}")`);
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        clicked = true;
        break;
      }
    }

    if (clicked) {
      // Wait for modal to appear
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });

      // Fill form with unique tag
      await page.fill('input[name="name"]', 'Test Cow');
      await page.fill('input[name="tag"]', uniqueTag);
      await page.fill('input[name="weight"]', '450');
      await page.fill('input[name="dob"]', '2024-01-15');
      await page.selectOption('select[name="breed"]', 'Friesian Holstein');
      await page.selectOption('select[name="gender"]', 'Betina');
      await page.selectOption('select[name="status"]', 'Laktasi');
      await page.fill('input[name="length"]', '120');
      await page.fill('input[name="chestCircumference"]', '180');
      await page.fill('textarea[name="reproductiveNotes"]', 'Test notes');

      // Submit
      await page.click('button:has-text("Simpan"), button:has-text("Daftarkan")');

      // Wait for cow to appear in table
      await page.waitForSelector(`text=${uniqueTag}`, { timeout: 10000 });

      // Verify cow was created
      await expect(page.locator(`text=${uniqueTag}`)).toBeVisible();
    }
  });
});

test.describe('Authentication Flow', () => {
  const baseURL = 'http://localhost:7500';

  test('should redirect to /in after logout and login again', async ({ page }) => {
    // Step 1: Login
    await page.goto(`${baseURL}/login`);
    await page.fill('input[type="email"]', 'admin@farm.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/in**`, { timeout: 10000 });

    // Verify we're on /in page
    expect(page.url()).toContain('/in');

    // Step 2: Logout
    // Look for logout button in navigation
    const logoutButton = page.getByText('Logout').first();
    await logoutButton.click();
    await page.waitForURL(`${baseURL}/login`, { timeout: 10000 });

    // Verify we're on login page
    expect(page.url()).toContain('/login');

    // Step 3: Login again
    await page.fill('input[type="email"]', 'admin@farm.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/in**`, { timeout: 10000 });

    // Verify we're redirected to /in page (this is the bug fix)
    expect(page.url()).toContain('/in');

    // Verify page loaded with navigation
    const navTexts = ['Ternak', 'Pemerahan', 'Input Harian', 'Laporan', 'Kegiatan'];
    let foundNav = false;
    for (const text of navTexts) {
      if (await page.locator(`text=${text}`).isVisible().catch(() => false)) {
        foundNav = true;
        break;
      }
    }
    expect(foundNav).toBeTruthy();
  });
});
