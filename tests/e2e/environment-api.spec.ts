import { test, expect } from '@playwright/test';

/**
 * Tests for environmental data API
 * Each test uses a unique date to avoid conflicts
 */
test.describe('Environment API Tests', () => {
  const baseURL = 'http://localhost:7500';

  // Generate unique date using timestamp to avoid collisions
  const getUniqueDate = () => {
    const now = new Date();
    // Use format: 2026-04-DD where DD is unique (01-28 + timestamp seconds)
    const day = String(1 + (now.getTime() % 28)).padStart(2, '0');
    return `2026-04-${day}`;
  };

  test('POST /api/environment should save complete environmental data', async ({ request }) => {
    const testDate = getUniqueDate();
    const uniqueId = `env_complete_${Date.now()}`;
    
    const envData = {
      id: uniqueId,
      date: testDate,
      tempMin: 22,
      tempMax: 32,
      humidity: 75,
      thunderstorm: false,
      notes: 'Test complete data',
    };

    const response = await request.post(`${baseURL}/api/environment`, {
      data: envData,
    });

    expect(response.ok()).toBeTruthy();
    
    const saved = await response.json();
    
    // Verify all fields are saved
    expect(saved.tempMin).toBe('22');
    expect(saved.tempMax).toBe('32');
    expect(saved.humidity).toBe(75);
    expect(parseFloat(saved.thi)).toBeGreaterThan(80);
    expect(saved.thunderstorm).toBe(false);
    expect(saved.notes).toBe('Test complete data');
    expect(saved.id).toBe(uniqueId);
    
    // Cleanup
    await request.delete(`${baseURL}/api/environment?id=${uniqueId}`);
  });

  test('GET /api/environment?date= should return complete data', async ({ request }) => {
    const testDate = getUniqueDate();
    const uniqueId = `env_get_${Date.now()}`;
    const testTempMin = '24';
    const testTempMax = '34';
    const testHumidity = 80;
    const testNotes = 'Test GET data';
    
    const createResponse = await request.post(`${baseURL}/api/environment`, {
      data: {
        id: uniqueId,
        date: testDate,
        tempMin: testTempMin,
        tempMax: testTempMax,
        humidity: testHumidity,
        thunderstorm: true,
        notes: testNotes,
      }
    });
    
    expect(createResponse.ok()).toBeTruthy();

    const getResponse = await request.get(`${baseURL}/api/environment?date=${testDate}`);
    expect(getResponse.ok()).toBeTruthy();
    
    const records = await getResponse.json();
    expect(records.length).toBe(1);
    
    const record = records[0];
    expect(record.id).toBe(uniqueId);
    expect(record.tempMin).toBe(testTempMin);
    expect(record.tempMax).toBe(testTempMax);
    expect(record.humidity).toBe(testHumidity);
    expect(record.thunderstorm).toBe(true);
    expect(record.notes).toBe(testNotes);
    
    await request.delete(`${baseURL}/api/environment?id=${uniqueId}`);
  });

  test('PUT /api/environment should update all fields', async ({ request }) => {
    const testDate = getUniqueDate();
    const uniqueId = `env_put_${Date.now()}`;
    
    await request.post(`${baseURL}/api/environment`, {
      data: {
        id: uniqueId,
        date: testDate,
        tempMin: 20,
        tempMax: 30,
        humidity: 70,
        thunderstorm: false,
        notes: 'Initial',
      }
    });

    const updateResponse = await request.put(`${baseURL}/api/environment`, {
      data: {
        id: uniqueId,
        date: testDate,
        tempMin: 25,
        tempMax: 35,
        humidity: 85,
        thunderstorm: true,
        notes: 'Updated',
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    const updated = await updateResponse.json();
    expect(updated.tempMin).toBe('25');
    expect(updated.tempMax).toBe('35');
    expect(updated.humidity).toBe(85);
    expect(updated.thunderstorm).toBe(true);
    expect(updated.notes).toBe('Updated');
    
    await request.delete(`${baseURL}/api/environment?id=${uniqueId}`);
  });

  test('POST /api/environment with existing date should update not create empty', async ({ request }) => {
    const testDate = getUniqueDate();
    const uniqueId = `env_upsert_check_${Date.now()}`;
    
    const createResponse = await request.post(`${baseURL}/api/environment`, {
      data: {
        id: uniqueId,
        date: testDate,
        tempMin: 22,
        tempMax: 32,
        humidity: 75,
        thunderstorm: false,
        notes: 'Initial complete data',
      }
    });
    
    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    expect(created.id).toBe(uniqueId);
    expect(created.tempMin).toBe('22');
    expect(created.tempMax).toBe('32');
    
    const updateResponse = await request.post(`${baseURL}/api/environment`, {
      data: {
        date: testDate,
        tempMin: 24,
        tempMax: 34,
        humidity: 80,
        thunderstorm: true,
        notes: 'Updated data',
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    const updated = await updateResponse.json();
    
    expect(updated.id).toBe(uniqueId);
    expect(updated.tempMin).toBe('24');
    expect(updated.tempMax).toBe('34');
    expect(updated.humidity).toBe(80);
    expect(updated.notes).toBe('Updated data');
    
    const getResponse = await request.get(`${baseURL}/api/environment?date=${testDate}`);
    const records = await getResponse.json();
    const verified = records.find((r: any) => r.id === uniqueId);
    
    expect(verified).toBeTruthy();
    expect(verified?.tempMin).toBe('24');
    expect(verified?.tempMax).toBe('34');
    
    await request.delete(`${baseURL}/api/environment?id=${uniqueId}`);
  });
});
