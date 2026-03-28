import { test, expect } from '@playwright/test';

/**
 * Tests for notes editing functionality in Input Harian
 * These tests verify the API handles notes correctly during create and update operations
 */
test.describe('Input Harian - Notes API Tests', () => {
  const baseURL = 'http://localhost:7500';

  test('POST /api/milking should save notes with new record', async ({ request }) => {
    const cowsRes = await request.get(`${baseURL}/api/cows`);
    const cows = await cowsRes.json();
    expect(cows.length).toBeGreaterThan(0);
    
    const cow = cows[0];
    const today = new Date().toISOString().split('T')[0];
    const testId = `M-notes-post-${Date.now()}`;
    const testNotes = 'Test notes from POST request';
    
    const response = await request.post(`${baseURL}/api/milking`, {
      data: {
        id: testId,
        cowId: cow.id,
        cowName: cow.name,
        date: today,
        session: 'Pagi',
        volume: 10.0,
        fat: 0,
        protein: 0,
        notes: testNotes,
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const saved = await response.json();
    expect(saved.notes).toBe(testNotes);
    
    // Cleanup
    await request.delete(`${baseURL}/api/milking?id=${testId}`);
  });

  test('PUT /api/milking should update notes on existing record', async ({ request }) => {
    const cowsRes = await request.get(`${baseURL}/api/cows`);
    const cows = await cowsRes.json();
    const cow = cows[0];
    const today = new Date().toISOString().split('T')[0];
    const testId = `M-notes-put-${Date.now()}`;
    
    // Create initial record
    await request.post(`${baseURL}/api/milking`, {
      data: {
        id: testId,
        cowId: cow.id,
        cowName: cow.name,
        date: today,
        session: 'Pagi',
        volume: 10.0,
        fat: 0,
        protein: 0,
        notes: 'Initial notes',
      }
    });
    
    // Update with new notes
    const updateResponse = await request.put(`${baseURL}/api/milking`, {
      data: {
        id: testId,
        cowId: cow.id,
        cowName: cow.name,
        date: today,
        session: 'Pagi',
        volume: 12.0,
        fat: 0,
        protein: 0,
        notes: 'Updated notes via PUT',
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    const updated = await updateResponse.json();
    expect(updated.notes).toBe('Updated notes via PUT');
    
    // Cleanup
    await request.delete(`${baseURL}/api/milking?id=${testId}`);
  });

  test('PUT /api/milking should preserve notes when not changed', async ({ request }) => {
    const cowsRes = await request.get(`${baseURL}/api/cows`);
    const cows = await cowsRes.json();
    const cow = cows[0];
    const today = new Date().toISOString().split('T')[0];
    const testId = `M-notes-preserve-${Date.now()}`;
    const originalNotes = 'Original notes that should persist';
    
    // Create initial record with notes
    await request.post(`${baseURL}/api/milking`, {
      data: {
        id: testId,
        cowId: cow.id,
        cowName: cow.name,
        date: today,
        session: 'Pagi',
        volume: 10.0,
        fat: 0,
        protein: 0,
        notes: originalNotes,
      }
    });
    
    // Update volume only, notes should remain
    const updateResponse = await request.put(`${baseURL}/api/milking`, {
      data: {
        id: testId,
        cowId: cow.id,
        cowName: cow.name,
        date: today,
        session: 'Pagi',
        volume: 15.0,
        fat: 0,
        protein: 0,
        notes: originalNotes, // Frontend should send the same notes
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    const updated = await updateResponse.json();
    expect(updated.notes).toBe(originalNotes);
    expect(updated.volume).toBe('15');
    
    // Cleanup
    await request.delete(`${baseURL}/api/milking?id=${testId}`);
  });

  test('PUT /api/milking should handle empty notes correctly', async ({ request }) => {
    const cowsRes = await request.get(`${baseURL}/api/cows`);
    const cows = await cowsRes.json();
    const cow = cows[0];
    const today = new Date().toISOString().split('T')[0];
    const testId = `M-notes-empty-${Date.now()}`;
    
    // Create with notes
    await request.post(`${baseURL}/api/milking`, {
      data: {
        id: testId,
        cowId: cow.id,
        cowName: cow.name,
        date: today,
        session: 'Pagi',
        volume: 10.0,
        fat: 0,
        protein: 0,
        notes: 'Some notes',
      }
    });
    
    // Update to clear notes
    const updateResponse = await request.put(`${baseURL}/api/milking`, {
      data: {
        id: testId,
        cowId: cow.id,
        cowName: cow.name,
        date: today,
        session: 'Pagi',
        volume: 15.0,
        fat: 0,
        protein: 0,
        notes: null,
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    const updated = await updateResponse.json();
    expect(updated.notes).toBeNull();
    
    // Cleanup
    await request.delete(`${baseURL}/api/milking?id=${testId}`);
  });

  test('Multiple sessions for same cow should all have notes', async ({ request }) => {
    const cowsRes = await request.get(`${baseURL}/api/cows`);
    const cows = await cowsRes.json();
    const cow = cows[0];
    const today = new Date().toISOString().split('T')[0];
    const testId1 = `M-notes-multi-1-${Date.now()}`;
    const testId2 = `M-notes-multi-2-${Date.now()}`;
    const testId3 = `M-notes-multi-3-${Date.now()}`;
    const sharedNotes = 'Notes for all sessions';
    
    // Create all three sessions
    const sessions = [
      { id: testId1, session: 'Pagi' },
      { id: testId2, session: 'Siang' },
      { id: testId3, session: 'Malam' },
    ];
    
    for (const s of sessions) {
      const res = await request.post(`${baseURL}/api/milking`, {
        data: {
          id: s.id,
          cowId: cow.id,
          cowName: cow.name,
          date: today,
          session: s.session,
          volume: 10.0,
          fat: 0,
          protein: 0,
          notes: sharedNotes,
        }
      });
      expect(res.ok()).toBeTruthy();
    }
    
    // Verify all have notes
    const milkingRes = await request.get(`${baseURL}/api/milking`);
    const milkings = await milkingRes.json();
    
    for (const id of [testId1, testId2, testId3]) {
      const record = milkings.find((m: any) => m.id === id);
      expect(record).toBeTruthy();
      expect(record.notes).toBe(sharedNotes);
    }
    
    // Cleanup
    for (const id of [testId1, testId2, testId3]) {
      await request.delete(`${baseURL}/api/milking?id=${id}`);
    }
  });
});
