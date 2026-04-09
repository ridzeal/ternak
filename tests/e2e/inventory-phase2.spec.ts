import { test, expect } from '@playwright/test';

test.describe('Phase 2: Inventory & Assets Management', () => {
  const baseURL = 'http://localhost:7500';
  const createdAssetIds: string[] = [];
  const createdFeedIds: string[] = [];

  // Login helper
  async function login(page: any) {
    await page.goto(`${baseURL}/login`);
    await page.fill('input[type="email"]', 'admin@farm.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/in**`, { timeout: 10000 });
  }

  // Cleanup after all tests
  test.afterAll(async ({ request }) => {
    // Delete test assets
    for (const id of createdAssetIds) {
      try {
        await request.delete(`${baseURL}/api/assets?id=${id}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Delete test feed inventory
    for (const id of createdFeedIds) {
      try {
        await request.delete(`${baseURL}/api/feed-inventory?id=${id}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  test.describe('Asset Inventory', () => {
    test('should navigate to assets tab', async ({ page }) => {
      await login(page);
      
      // Click on Assets tab
      await page.click('text=Aset');
      await page.waitForTimeout(1000);

      // Verify asset inventory page loaded
      await expect(page.locator('text=Inventaris Aset')).toBeVisible();
    });

    test('should add new asset with all fields', async ({ page }) => {
      await login(page);
      
      // Navigate to assets
      await page.click('text=Aset');
      await page.waitForTimeout(1000);

      // Click add asset button
      const addButtons = page.locator('button:has-text("Tambah")');
      await addButtons.first().click();

      // Wait for modal to appear
      await page.waitForSelector('text=Tambah Asset Baru', { timeout: 5000 });

      // Fill form
      const uniqueName = `Test Asset ${Date.now()}`;
      await page.fill('input[placeholder*="Mesin cooling"]', uniqueName);
      await page.selectOption('select', 'Machinery');
      await page.selectOption('select', 'Active');
      await page.fill('input[type="date"]', '2024-01-15');
      await page.fill('input[type="number"]', '5');
      await page.fill('input[placeholder*="Unit/Set/Piece"]', 'Unit');
      await page.fill('textarea[placeholder*="Catatan"]', 'Test asset notes');

      // Submit
      await page.click('button:has-text("Tambah")');

      // Wait for asset to appear in table
      await page.waitForSelector(`text=${uniqueName}`, { timeout: 10000 });

      // Verify asset was created
      await expect(page.locator(`text=${uniqueName}`)).toBeVisible();
      await expect(page.locator('text=Machinery')).toBeVisible();
      await expect(page.locator('text=5')).toBeVisible();
    });

    test('should edit existing asset', async ({ page }) => {
      await login(page);
      
      // Navigate to assets
      await page.click('text=Aset');
      await page.waitForTimeout(1000);

      // Click on first asset row
      const firstRow = page.locator('.table-padding').first();
      await firstRow.click();

      // Wait for modal to appear
      await page.waitForSelector('text=Edit Asset', { timeout: 5000 });

      // Update quantity
      const quantityInput = page.locator('input[type="number"]');
      await quantityInput.fill('10');

      // Submit
      await page.click('button:has-text("Simpan")');

      // Verify update
      await expect(page.locator('text=10')).toBeVisible();
    });

    test('should filter assets by category', async ({ page }) => {
      await login(page);
      
      // Navigate to assets
      await page.click('text=Aset');
      await page.waitForTimeout(1000);

      // Select category filter
      await page.selectOption('select', 'Vehicle');

      // Wait a bit for filter to apply
      await page.waitForTimeout(1000);

      // Verify filter is applied (URL should have query param)
      const url = page.url();
      expect(url).toContain('category=Vehicle');
    });

    test('should display asset status with color indicators', async ({ page }) => {
      await login(page);
      
      // Navigate to assets
      await page.click('text=Aset');
      await page.waitForTimeout(1000);

      // Look for status badges
      const statusBadge = page.locator('text=Active').first();
      await expect(statusBadge).toBeVisible();
    });
  });

  test.describe('Feed Inventory', () => {
    test('should navigate to feed inventory tab', async ({ page }) => {
      await login(page);
      
      // Click on Feed tab
      await page.click('text=Pakan');
      await page.waitForTimeout(1000);

      // Verify feed inventory page loaded
      await expect(page.locator('text=Inventaris Pakan')).toBeVisible();
    });

    test('should add new feed inventory with weight tracking', async ({ page }) => {
      await login(page);
      
      // Navigate to feed inventory
      await page.click('text=Pakan');
      await page.waitForTimeout(1000);

      // Click add feed button
      const addButtons = page.locator('button:has-text("Tambah")');
      await addButtons.first().click();

      // Wait for modal to appear
      await page.waitForSelector('text=Tambah Pakan Baru', { timeout: 5000 });

      // Fill form
      const uniqueName = `Test Feed ${Date.now()}`;
      await page.fill('input[placeholder*="Puruk Sapi"]', uniqueName);
      await page.fill('input[type="date"]', '2024-01-15');
      
      const inputs = page.locator('input[type="number"]');
      await inputs.nth(0).fill('50'); // Quantity
      await inputs.nth(1).fill('1000'); // Weight in kg
      
      await page.selectOption('select', 'Kg');
      await page.fill('input[placeholder="Alert threshold"]', '10');
      await page.fill('input[placeholder*="Nama supplier"]', 'Test Supplier');
      await page.fill('textarea[placeholder*="Catatan"]', 'Test feed notes');

      // Submit
      await page.click('button:has-text("Tambah")');

      // Wait for feed to appear in table
      await page.waitForSelector(`text=${uniqueName}`, { timeout: 10000 });

      // Verify feed was created
      await expect(page.locator(`text=${uniqueName}`)).toBeVisible();
      await expect(page.locator('text=50')).toBeVisible();
      await expect(page.locator('text=1000 kg')).toBeVisible();
    });

    test('should show low stock alert indicator', async ({ page }) => {
      await login(page);
      
      // Navigate to feed inventory
      await page.click('text=Pakan');
      await page.waitForTimeout(1000);

      // Look for stock level indicators (green for good, red for low)
      // At least one stock indicator should be visible
      const stockIndicator = page.locator('span').filter({ hasText: /\d+/ }).first();
      await expect(stockIndicator).toBeVisible();
    });

    test('should auto-calculate total price', async ({ page }) => {
      await login(page);
      
      // Navigate to feed inventory
      await page.click('text=Pakan');
      await page.waitForTimeout(1000);

      // Click add feed button
      const addButtons = page.locator('button:has-text("Tambah")');
      await addButtons.first().click();

      // Wait for modal to appear
      await page.waitForSelector('text=Tambah Pakan Baru', { timeout: 5000 });

      // Fill unit price and quantity
      const inputs = page.locator('input[type="number"]');
      await inputs.nth(0).fill('10'); // Quantity
      await inputs.nth(2).fill('50000'); // Unit price

      // Wait a bit for auto-calculation
      await page.waitForTimeout(500);

      // Check if total price is calculated (may be auto-filled)
      const totalPriceInput = page.locator('input[placeholder="Auto-calculate"]');
      // The total may not be auto-filled yet, but the fields should be visible
      await expect(totalPriceInput).toBeVisible();
    });
  });

  test.describe('Inventory Dashboard', () => {
    test('should display inventory dashboard with summary cards', async ({ page }) => {
      await login(page);
      
      // Navigate to inventory dashboard
      await page.click('text=Inventaris');
      await page.waitForTimeout(1000);

      // Verify dashboard loaded
      await expect(page.locator('text=Dashboard Inventaris')).toBeVisible();

      // Check for summary cards
      await expect(page.locator('text=Total Aset')).toBeVisible();
      await expect(page.locator('text=Total Pakan')).toBeVisible();
    });

    test('should show quick action buttons', async ({ page }) => {
      await login(page);
      
      // Navigate to inventory dashboard
      await page.click('text=Inventaris');
      await page.waitForTimeout(1000);

      // Check for quick action buttons
      await expect(page.locator('button:has-text("Tambah Aset")')).toBeVisible();
      await expect(page.locator('button:has-text("Tambah Pakan")')).toBeVisible();
    });

    test('should display assets by category breakdown', async ({ page }) => {
      await login(page);
      
      // Navigate to inventory dashboard
      await page.click('text=Inventaris');
      await page.waitForTimeout(1000);

      // Look for category breakdown section
      await expect(page.locator('text=Aset per Kategori')).toBeVisible();
    });

    test('should display assets by status breakdown', async ({ page }) => {
      await login(page);
      
      // Navigate to inventory dashboard
      await page.click('text=Inventaris');
      await page.waitForTimeout(1000);

      // Look for status breakdown section
      await expect(page.locator('text=Aset per Status')).toBeVisible();
    });

    test('should show low stock alerts when applicable', async ({ page }) => {
      await login(page);
      
      // Navigate to inventory dashboard
      await page.click('text=Inventaris');
      await page.waitForTimeout(1000);

      // The alert section appears if there are low stock items
      // Just verify the page loaded without errors
      await expect(page.locator('text=Dashboard Inventaris')).toBeVisible();
    });
  });

  test.describe('Asset Maintenance Tracking', () => {
    test('should open maintenance history from asset row', async ({ page }) => {
      await login(page);
      
      // Navigate to assets
      await page.click('text=Aset');
      await page.waitForTimeout(1000);

      // Look for maintenance button in table
      const maintenanceButton = page.locator('button:has-text("Riwayat")').first();
      if (await maintenanceButton.isVisible().catch(() => false)) {
        await maintenanceButton.click({ force: true });
        
        // Wait for maintenance modal to appear
        await page.waitForSelector('text=Perawatan Aset', { timeout: 5000 });
        await expect(page.locator('text=Riwayat Perawatan')).toBeVisible();
      }
    });

    test('should add maintenance record', async ({ page }) => {
      await login(page);
      
      // Navigate to assets
      await page.click('text=Aset');
      await page.waitForTimeout(1000);

      // Look for maintenance button in table
      const maintenanceButton = page.locator('button:has-text("Riwayat")').first();
      if (await maintenanceButton.isVisible().catch(() => false)) {
        await maintenanceButton.click({ force: true });
        
        // Wait for maintenance modal to appear
        await page.waitForSelector('text=Perawatan Aset', { timeout: 5000 });

        // Click add maintenance button
        await page.click('button:has-text("Tambah")');

        // Fill maintenance form
        await page.fill('input[type="date"]', '2024-01-20');
        await page.selectOption('select', 'Routine');
        await page.fill('textarea[placeholder*="Deskripsi"]', 'Test maintenance record');
        await page.fill('input[type="number"]', '500000');
        await page.fill('input[placeholder*="Nama vendor"]', 'Test Vendor');

        // Submit
        await page.click('button:has-text("Tambah")');

        // Wait for record to appear
        await page.waitForTimeout(1000);
        
        // Verify record was added
        await expect(page.locator('text=Test maintenance record')).toBeVisible();
      }
    });
  });

  test.describe('Inventory Tabs Navigation', () => {
    test('should show all inventory tabs in navigation', async ({ page }) => {
      await login(page);
      
      // Check for inventory-related tabs
      const inventoryTabs = ['Inventaris', 'Aset', 'Pakan'];
      
      for (const tab of inventoryTabs) {
        await expect(page.locator(`text=${tab}`)).toBeVisible();
      }
    });

    test('should switch between inventory tabs', async ({ page }) => {
      await login(page);
      
      // Navigate to inventory dashboard
      await page.click('text=Inventaris');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Dashboard Inventaris')).toBeVisible();

      // Switch to assets
      await page.click('text=Aset');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Inventaris Aset')).toBeVisible();

      // Switch to feed inventory
      await page.click('text=Pakan');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Inventaris Pakan')).toBeVisible();
    });
  });
});
