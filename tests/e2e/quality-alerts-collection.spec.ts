import { test, expect } from '@playwright/test';

const login = async (page) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  if (await page.locator('input[type="email"]').isVisible().catch(() => false)) {
    await page.fill('input[type="email"]', 'admin@farm.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/in**', { timeout: 10000 });
    await page.waitForTimeout(2000);
  }
};

test.describe('Milk Quality Alerts (Task 1.5)', () => {
  test('should show quality alert when fat is out of range', async ({ page }) => {
    await login(page);

    // Navigate to Pemerahan tab
    const pemerahanButton = page.locator('button:has-text("Pemerahan")');
    if (await pemerahanButton.isVisible().catch(() => false)) {
      await pemerahanButton.click();
      await page.waitForTimeout(1000);
    }

    // Open add milking modal
    const addButton = page.locator('button:has-text("Tambah")').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }

    // Fill form with out-of-range fat value (too low: 1.5%)
    const cowSelect = page.locator('select').first();
    if (await cowSelect.isVisible().catch(() => false)) {
      const options = await cowSelect.locator('option').count();
      if (options > 1) {
        await cowSelect.selectIndex(1);
      }
    }

    const volumeInput = page.locator('input[placeholder="mis. 12.5"]');
    if (await volumeInput.isVisible().catch(() => false)) {
      await volumeInput.fill('10');
    }

    // Set fat to a value significantly below normal range (3.0%)
    const fatInput = page.locator('input[placeholder="mis. 3.8"]');
    if (await fatInput.isVisible().catch(() => false)) {
      await fatInput.fill('1.5');
    }

    // Wait for quality check to trigger
    await page.waitForTimeout(500);

    // Check for quality alert
    const qualityAlert = page.locator('text=Quality Alert');
    const hasAlert = await qualityAlert.isVisible().catch(() => false);

    // Either the alert shows OR the fat input border changed color
    const fatInputStyle = await fatInput.evaluate((el: HTMLElement) => {
      return el.style.borderColor;
    }).catch(() => '');

    expect(hasAlert || fatInputStyle === 'rgb(192, 57, 43)' || fatInputStyle === '#c0392b').toBeTruthy();
  });

  test('should show warning for slightly out-of-range lactose', async ({ page }) => {
    await login(page);

    // Navigate to Pemerahan tab
    const pemerahanButton = page.locator('button:has-text("Pemerahan")');
    if (await pemerahanButton.isVisible().catch(() => false)) {
      await pemerahanButton.click();
      await page.waitForTimeout(1000);
    }

    // Open add milking modal
    const addButton = page.locator('button:has-text("Tambah")').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }

    // Select a cow
    const cowSelect = page.locator('select').first();
    if (await cowSelect.isVisible().catch(() => false)) {
      const options = await cowSelect.locator('option').count();
      if (options > 1) {
        await cowSelect.selectIndex(1);
      }
    }

    const volumeInput = page.locator('input[placeholder="mis. 12.5"]');
    if (await volumeInput.isVisible().catch(() => false)) {
      await volumeInput.fill('10');
    }

    // Set lactose slightly below minimum (4.0% when min is 4.5%)
    const lactoseInput = page.locator('input[placeholder="min. 4.5"]');
    if (await lactoseInput.isVisible().catch(() => false)) {
      await lactoseInput.fill('4.0');
    }

    await page.waitForTimeout(500);

    // Check for quality status text below the input
    const qualityText = page.locator('text=below normal');
    const hasWarning = await qualityText.isVisible().catch(() => false);

    expect(hasWarning).toBeTruthy();
  });

  test('should show normal indicator for values in range', async ({ page }) => {
    await login(page);

    // Navigate to Pemerahan tab
    const pemerahanButton = page.locator('button:has-text("Pemerahan")');
    if (await pemerahanButton.isVisible().catch(() => false)) {
      await pemerahanButton.click();
      await page.waitForTimeout(1000);
    }

    // Open add milking modal
    const addButton = page.locator('button:has-text("Tambah")').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }

    // Select a cow
    const cowSelect = page.locator('select').first();
    if (await cowSelect.isVisible().catch(() => false)) {
      const options = await cowSelect.locator('option').count();
      if (options > 1) {
        await cowSelect.selectIndex(1);
      }
    }

    const volumeInput = page.locator('input[placeholder="mis. 12.5"]');
    if (await volumeInput.isVisible().catch(() => false)) {
      await volumeInput.fill('10');
    }

    // Set fat to normal value (3.8%)
    const fatInput = page.locator('input[placeholder="mis. 3.8"]');
    if (await fatInput.isVisible().catch(() => false)) {
      await fatInput.fill('3.8');
    }

    await page.waitForTimeout(500);

    // Check for normal indicator
    const normalText = page.locator('text=✅ Normal');
    const hasNormal = await normalText.isVisible().catch(() => false);

    expect(hasNormal).toBeTruthy();
  });
});

test.describe('Milk Collection Tracking (Task 1.6)', () => {
  test('should navigate to Penjualan tab', async ({ page }) => {
    await login(page);

    // Navigate to Penjualan tab
    const penjualanButton = page.locator('button:has-text("Penjualan")');
    if (await penjualanButton.isVisible().catch(() => false)) {
      await penjualanButton.click();
      await page.waitForTimeout(2000);

      // Verify page shows Penjualan content
      const hasTitle = await page.locator('text=Penjualan Susu').isVisible().catch(() => false);
      expect(hasTitle).toBeTruthy();
    }
  });

  test('should open milk collection form', async ({ page }) => {
    await login(page);

    // Navigate to Penjualan tab
    const penjualanButton = page.locator('button:has-text("Penjualan")');
    if (await penjualanButton.isVisible().catch(() => false)) {
      await penjualanButton.click();
      await page.waitForTimeout(1000);
    }

    // Click Tambah Data button
    const tambahButton = page.locator('button:has-text("Tambah Data")');
    if (await tambahButton.isVisible().catch(() => false)) {
      await tambahButton.click();
      await page.waitForTimeout(1000);
    }

    // Check form fields exist
    const hasBuyerField = await page.locator('input[placeholder="mis. Kansas"]').isVisible().catch(() => false);
    const hasQuantityField = await page.locator('input[placeholder="mis. 150.5"]').isVisible().catch(() => false);

    expect(hasBuyerField || hasQuantityField).toBeTruthy();
  });

  test('should validate required fields in collection form', async ({ page }) => {
    await login(page);

    // Navigate to Penjualan tab
    const penjualanButton = page.locator('button:has-text("Penjualan")');
    if (await penjualanButton.isVisible().catch(() => false)) {
      await penjualanButton.click();
      await page.waitForTimeout(1000);
    }

    // Click Tambah Data
    const tambahButton = page.locator('button:has-text("Tambah Data")');
    if (await tambahButton.isVisible().catch(() => false)) {
      await tambahButton.click();
      await page.waitForTimeout(1000);
    }

    // Try to submit empty form
    const submitButton = page.locator('button:has-text("Simpan")');
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }

    // Check for validation errors
    const hasBuyerError = await page.locator('text=Nama pembeli wajib diisi').isVisible().catch(() => false);
    const hasQuantityError = await page.locator('text=Jumlah harus lebih dari 0').isVisible().catch(() => false);

    expect(hasBuyerError || hasQuantityError).toBeTruthy();
  });

  test('should save milk collection record', async ({ page }) => {
    await login(page);

    // Navigate to Penjualan tab
    const penjualanButton = page.locator('button:has-text("Penjualan")');
    if (await penjualanButton.isVisible().catch(() => false)) {
      await penjualanButton.click();
      await page.waitForTimeout(1000);
    }

    // Click Tambah Data
    const tambahButton = page.locator('button:has-text("Tambah Data")');
    if (await tambahButton.isVisible().catch(() => false)) {
      await tambahButton.click();
      await page.waitForTimeout(1000);
    }

    // Fill form
    const buyerInput = page.locator('input[placeholder="mis. Kansas"]');
    if (await buyerInput.isVisible().catch(() => false)) {
      await buyerInput.fill('Kansas');
    }

    const quantityInput = page.locator('input[placeholder="mis. 150.5"]');
    if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill('125.5');
    }

    const fatAvgInput = page.locator('input[placeholder="mis. 3.8"]');
    if (await fatAvgInput.isVisible().catch(() => false)) {
      await fatAvgInput.fill('3.9');
    }

    // Submit
    const submitButton = page.locator('button:has-text("Simpan")');
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }

    // Check for success toast
    const successToast = page.locator('text=berhasil disimpan');
    const hasSuccess = await successToast.isVisible().catch(() => false);

    expect(hasSuccess).toBeTruthy();
  });
});
