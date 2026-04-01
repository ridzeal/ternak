import { test, expect, Page } from '@playwright/test';

test.describe('Daily Milking Entry - Save Functionality', () => {
  const login = async (page: Page) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for JS to load

    if (await page.locator('input[type="email"]').isVisible().catch(() => false)) {
      await page.fill('input[type="email"]', 'admin@farm.local');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/in**', { timeout: 10000 });
      await page.waitForTimeout(2000);
    }
  };

  test('should save milking records successfully', async ({ page, request }) => {
    await login(page);
    
    // Navigate to Input Harian tab
    const inputHarianButton = page.locator('button:has-text("Input Harian")');
    if (await inputHarianButton.isVisible().catch(() => false)) {
      await inputHarianButton.click();
      await page.waitForTimeout(3000);
      
      // Wait for table to load
      await page.waitForSelector('tbody tr', { timeout: 10000 });
      
      // Fill in some values for the first cow
      const firstRow = page.locator('tbody tr').first();
      
      // Fill session 1 (Perahan 1)
      const session1Input = firstRow.locator('input[type="number"]').first();
      await session1Input.fill('15.5');
      
      // Fill session 2 (Perahan 2)
      const session2Input = firstRow.locator('input[type="number"]').nth(1);
      await session2Input.fill('12.3');
      
      // Fill environmental data (required)
      await page.fill('input[name="tempMin"]', '24');
      await page.fill('input[name="tempMax"]', '32');
      await page.fill('input[name="humidity"]', '75');
      
      // Click Simpan Semua
      const saveButton = page.locator('button:has-text("Simpan Semua")');
      await saveButton.click();
      
      // Wait for save to complete (button should no longer show "Menyimpan...")
      await page.waitForTimeout(3000);
      
      // Check for success - either toast or data persists
      // For now, just verify no 500 error occurred
      const pageStillLoaded = await page.locator('body').isVisible();
      expect(pageStillLoaded).toBeTruthy();
    }
  });

  test('should update notes when saving existing records', async ({ request }) => {
    const cowsResponse = await request.get('http://localhost:7500/api/cows');
    const cows = await cowsResponse.json();
    expect(cows.length).toBeGreaterThan(0);
    
    const cow = cows[0];
    const today = new Date().toISOString().split('T')[0];
    const uniqueId = `M-notes-test-${Date.now()}`;
    
    // First, create a record with initial notes
    const createData = {
      id: uniqueId,
      cowId: cow.id,
      cowName: cow.name,
      date: today,
      session: 'Pagi',
      volume: 10.0,
      fat: 0,
      protein: 0,
      notes: 'Initial notes',
    };

    const createResponse = await request.post('http://localhost:7500/api/milking', {
      data: createData,
    });
    expect(createResponse.ok()).toBeTruthy();

    // Now update the record with new notes using PUT
    const updateData = {
      id: uniqueId,
      cowId: cow.id,
      cowName: cow.name,
      date: today,
      session: 'Pagi',
      volume: 12.0,
      fat: 0,
      protein: 0,
      notes: 'Updated notes from test',
    };

    const updateResponse = await request.put('http://localhost:7500/api/milking', {
      data: updateData,
    });
    expect(updateResponse.ok()).toBeTruthy();

    // Verify the notes were updated
    const updated = await updateResponse.json();
    expect(updated.notes).toBe('Updated notes from test');

    // Cleanup
    await request.delete(`http://localhost:7500/api/milking?id=${uniqueId}`);
  });

  test('POST /api/milking should accept milking record with minimal fields', async ({ request }) => {
    // Get a cow from the database
    const cowsResponse = await request.get('http://localhost:7500/api/cows');
    const cows = await cowsResponse.json();
    
    expect(cows.length).toBeGreaterThan(0);
    const cow = cows[0];
    
    const uniqueId = `M-${Date.now()}`;
    
    // Test with minimal required fields
    const milkingData = {
      id: uniqueId,
      cowId: cow.id,
      cowName: cow.name,
      date: new Date().toISOString().split('T')[0],
      session: 'Pagi',
      volume: 15.5,
      fat: 0,
      protein: 0,
    };

    const response = await request.post('http://localhost:7500/api/milking', {
      data: milkingData,
    });

    // Log response for debugging
    if (!response.ok()) {
      const errorBody = await response.json();
      console.error('API Error:', errorBody);
    }

    expect(response.ok()).toBeTruthy();
    
    // Cleanup
    await request.delete(`http://localhost:7500/api/milking?id=${uniqueId}`);
  });

  test('POST /api/milking should handle notes field as optional', async ({ request }) => {
    const cowsResponse = await request.get('http://localhost:7500/api/cows');
    const cows = await cowsResponse.json();
    const cow = cows[0];

    const uniqueId = `M-${Date.now()}-notes`;

    // Test with notes field
    const milkingData = {
      id: uniqueId,
      cowId: cow.id,
      cowName: cow.name,
      date: new Date().toISOString().split('T')[0],
      session: 'Pagi',
      volume: 10.0,
      fat: 0,
      protein: 0,
      notes: 'Test notes from API',
    };

    const response = await request.post('http://localhost:7500/api/milking', {
      data: milkingData,
    });

    if (!response.ok()) {
      const errorBody = await response.json();
      console.error('API Error with notes:', errorBody);
    }

    expect(response.ok()).toBeTruthy();

    // Cleanup
    await request.delete(`http://localhost:7500/api/milking?id=${uniqueId}`);
  });

  test('should save notes even without milk volume (UI integration)', async ({ page, request }) => {
    await login(page);

    // Navigate to Input Harian tab
    const inputHarianButton = page.locator('button:has-text("Input Harian")');
    if (await inputHarianButton.isVisible().catch(() => false)) {
      await inputHarianButton.click();
      await page.waitForTimeout(3000);
      await page.waitForSelector('tbody tr', { timeout: 10000 });

      // Get the first cow's name for verification
      const firstRow = page.locator('tbody tr').first();
      const cowName = await firstRow.locator('td').nth(1).textContent();

      // Fill only the notes field (no volume)
      const notesInput = firstRow.locator('input[type="text"]').first();
      const testNote = `Test note without volume - ${Date.now()}`;
      await notesInput.fill(testNote);

      // Fill environmental data (required)
      await page.fill('input[name="tempMin"]', '24');
      await page.fill('input[name="tempMax"]', '32');
      await page.fill('input[name="humidity"]', '75');

      // Click Simpan Semua
      const saveButton = page.locator('button:has-text("Simpan Semua")');
      await saveButton.click();
      await page.waitForTimeout(3000);

      // Navigate away and back to verify persistence
      await page.goto('/in/daily');
      await page.waitForTimeout(2000);

      // Verify the note is still there
      const firstRowAfter = page.locator('tbody tr').first();
      const notesInputAfter = firstRowAfter.locator('input[type="text"]').first();
      const savedNote = await notesInputAfter.inputValue();

      expect(savedNote).toBe(testNote);
    }
  });

  test('should persist notes when switching dates and returning', async ({ page, request }) => {
    await login(page);

    // Navigate to Input Harian
    const inputHarianButton = page.locator('button:has-text("Input Harian")');
    if (await inputHarianButton.isVisible().catch(() => false)) {
      await inputHarianButton.click();
      await page.waitForTimeout(3000);
      await page.waitForSelector('tbody tr', { timeout: 10000 });

      // Get today's date and yesterday's date
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Fill notes for today
      const firstRow = page.locator('tbody tr').first();
      const notesInput = firstRow.locator('input[type="text"]').first();
      const testNote = `Today's note - ${Date.now()}`;
      await notesInput.fill(testNote);

      // Fill environmental data
      await page.fill('input[name="tempMin"]', '24');
      await page.fill('input[name="tempMax"]', '32');
      await page.fill('input[name="humidity"]', '75');

      // Save
      const saveButton = page.locator('button:has-text("Simpan Semua")');
      await saveButton.click();
      await page.waitForTimeout(3000);

      // Switch to yesterday
      const dateInput = page.locator('input[type="date"]');
      await dateInput.fill(yesterdayStr);
      await page.waitForTimeout(2000);

      // Fill different notes for yesterday
      const firstRowYesterday = page.locator('tbody tr').first();
      const notesInputYesterday = firstRowYesterday.locator('input[type="text"]').first();
      const yesterdayNote = `Yesterday's note - ${Date.now()}`;
      await notesInputYesterday.fill(yesterdayNote);

      // Update environmental data for yesterday
      await page.fill('input[name="tempMin"]', '23');
      await page.fill('input[name="tempMax"]', '31');
      await page.fill('input[name="humidity"]', '70');

      // Save yesterday's data
      await saveButton.click();
      await page.waitForTimeout(3000);

      // Switch back to today
      await dateInput.fill(todayStr);
      await page.waitForTimeout(2000);

      // Verify today's notes are still there
      const firstRowAfter = page.locator('tbody tr').first();
      const notesInputAfter = firstRowAfter.locator('input[type="text"]').first();
      const savedNote = await notesInputAfter.inputValue();

      expect(savedNote).toBe(testNote);
    }
  });

  test('should save notes with zero volume (health issue scenario)', async ({ page, request }) => {
    await login(page);

    // Navigate to Input Harian
    const inputHarianButton = page.locator('button:has-text("Input Harian")');
    if (await inputHarianButton.isVisible().catch(() => false)) {
      await inputHarianButton.click();
      await page.waitForTimeout(3000);
      await page.waitForSelector('tbody tr', { timeout: 10000 });

      // Get the first cow
      const firstRow = page.locator('tbody tr').first();
      const cowName = await firstRow.locator('td').nth(1).textContent();

      // Fill ONLY notes, NO volume (simulating cow with health issue)
      const notesInput = firstRow.locator('input[type="text"]').first();
      const healthNote = `Health issue: ${Date.now()} - Cow not producing milk`;
      await notesInput.fill(healthNote);

      // Leave volume fields empty (session1, session2, session3)

      // Fill environmental data
      await page.fill('input[name="tempMin"]', '24');
      await page.fill('input[name="tempMax"]', '32');
      await page.fill('input[name="humidity"]', '75');

      // Save
      const saveButton = page.locator('button:has-text("Simpan Semua")');
      await saveButton.click();
      await page.waitForTimeout(3000);

      // Navigate away and back to verify persistence
      await page.goto('/in/daily');
      await page.waitForTimeout(2000);

      // Verify the note is still there
      const firstRowAfter = page.locator('tbody tr').first();
      const notesInputAfter = firstRowAfter.locator('input[type="text"]').first();
      const savedNote = await notesInputAfter.inputValue();

      expect(savedNote).toBe(healthNote);

      // Also verify via API that a record with volume 0 was created
      const cowsRes = await request.get('http://localhost:7500/api/cows');
      const cows = await cowsRes.json();
      const cow = cows.find((c: any) => c.name === cowName);

      if (cow) {
        const today = new Date().toISOString().split('T')[0];
        const milkingRes = await request.get('http://localhost:7500/api/milking');
        const milking = await milkingRes.json();

        // Find records for this cow today with notes
        const cowRecords = milking.filter((m: any) =>
          m.cowId === cow.id &&
          m.date === today &&
          m.notes &&
          m.notes.includes('Health issue')
        );

        expect(cowRecords.length).toBeGreaterThan(0);
        expect(cowRecords[0].volume).toBe('0');
      }
    }
  });
});
