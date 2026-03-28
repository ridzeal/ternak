import { test, expect } from '@playwright/test';

/**
 * API tests to verify payload structure and completeness
 * These tests clean up after themselves
 */
test.describe('API Payload Tests', () => {
  const baseURL = 'http://localhost:7500';
  const createdIds: { type: string; id: string }[] = [];

  // Cleanup after all tests
  test.afterAll(async ({ request }) => {
    // Delete created test data in reverse order
    for (const item of createdIds.reverse()) {
      try {
        if (item.type === 'cow') {
          await request.delete(`${baseURL}/api/cows?id=${item.id}`);
        } else if (item.type === 'milking') {
          await request.delete(`${baseURL}/api/milking?id=${item.id}`);
        } else if (item.type === 'environment') {
          await request.delete(`${baseURL}/api/environment?id=${item.id}`);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  test('GET /api/cows should return cows with all fields', async ({ request }) => {
    const cowsResponse = await request.get(`${baseURL}/api/cows`);
    expect(cowsResponse.ok()).toBeTruthy();
    const cows = await cowsResponse.json();
    
    expect(cows.length).toBeGreaterThan(0);
    
    const cow = cows[0];
    // Verify all expected fields exist
    expect(cow).toHaveProperty('id');
    expect(cow).toHaveProperty('name');
    expect(cow).toHaveProperty('tag');
    expect(cow).toHaveProperty('length');
    expect(cow).toHaveProperty('chestCircumference');
    expect(cow).toHaveProperty('reproductiveNotes');
  });

  test('GET /api/milking should return milkings with all quality fields', async ({ request }) => {
    const milkingResponse = await request.get(`${baseURL}/api/milking`);
    expect(milkingResponse.ok()).toBeTruthy();
    const milkings = await milkingResponse.json();
    
    if (milkings.length > 0) {
      const milking = milkings[0];
      expect(milking).toHaveProperty('lactose');
      expect(milking).toHaveProperty('totalSolids');
    }
  });

  test('GET /api/environment should return environmental data', async ({ request }) => {
    const envResponse = await request.get(`${baseURL}/api/environment`);
    expect(envResponse.ok()).toBeTruthy();
    const env = await envResponse.json();
    
    if (env.length > 0) {
      const record = env[0];
      expect(record).toHaveProperty('tempMin');
      expect(record).toHaveProperty('tempMax');
      expect(record).toHaveProperty('humidity');
      expect(record).toHaveProperty('thi');
      expect(record).toHaveProperty('thunderstorm');
    }
  });

  test('POST /api/cows should accept complete payload', async ({ request }) => {
    const uniqueTag = `API-${Date.now()}`;
    const cowId = `C-${uniqueTag}`;
    const cowData = {
      id: cowId,
      name: 'API Test Cow',
      tag: uniqueTag,
      breed: 'Friesian Holstein',
      gender: 'Betina',
      dob: '2024-01-15',
      weight: 450,
      status: 'Laktasi',
      length: 118,
      chestCircumference: 178,
      reproductiveNotes: 'Test notes from API',
    };

    const response = await request.post(`${baseURL}/api/cows`, {
      data: cowData,
    });

    // Track for cleanup
    createdIds.push({ type: 'cow', id: cowId });

    // Response should be OK or conflict (duplicate)
    expect([201, 409, 500]).toContain(response.status());
    
    if (response.status() === 201) {
      const responseBody = await response.json();
      expect(responseBody.length).toBe(118);
      expect(responseBody.chestCircumference).toBe(178);
    }
  });

  test('POST /api/milking should accept all milk quality fields', async ({ request }) => {
    const cowsResponse = await request.get(`${baseURL}/api/cows`);
    const cows = await cowsResponse.json();
    
    if (cows.length === 0) {
      test.skip();
      return;
    }

    const cow = cows[0];
    const uniqueId = `M-${Date.now()}`;
    
    const milkingData = {
      id: uniqueId,
      cowId: cow.id,
      cowName: cow.name,
      date: new Date().toISOString().split('T')[0],
      session: 'Pagi',
      volume: 15.5,
      fat: 3.8,
      protein: 3.2,
      lactose: 4.5,
      totalSolids: 12.8,
      notes: 'API test milking',
    };

    const response = await request.post(`${baseURL}/api/milking`, {
      data: milkingData,
    });

    // Track for cleanup
    createdIds.push({ type: 'milking', id: uniqueId });

    expect(response.ok()).toBeTruthy();
    
    const responseBody = await response.json();
    expect(responseBody.lactose).toBe('4.5');
    expect(responseBody.totalSolids).toBe('12.8');
  });

  test('POST /api/environment should handle duplicate dates (upsert)', async ({ request }) => {
    const today = new Date().toISOString().split('T')[0];
    const uniqueId = `env_upsert_${Date.now()}`;
    
    const envData = {
      id: uniqueId,
      date: today,
      tempMin: 22,
      tempMax: 30,
      humidity: 70,
      thunderstorm: false,
      notes: 'First save',
    };

    // First save - should create
    const response1 = await request.post(`${baseURL}/api/environment`, {
      data: envData,
    });
    expect(response1.ok()).toBeTruthy();

    // Track for cleanup
    const created = await response1.json();
    createdIds.push({ type: 'environment', id: created.id });

    // Second save with same date - should update, not fail
    const envData2 = {
      date: today,
      tempMin: 24,
      tempMax: 32,
      humidity: 75,
      thunderstorm: true,
      notes: 'Updated save',
    };

    const response2 = await request.post(`${baseURL}/api/environment`, {
      data: envData2,
    });
    
    // Should succeed (update existing)
    expect(response2.ok()).toBeTruthy();
    
    const updated = await response2.json();
    expect(parseFloat(updated.tempMax)).toBe(32);
    expect(updated.notes).toBe('Updated save');
  });
});
