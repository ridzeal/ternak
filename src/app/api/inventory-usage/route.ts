import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedInventory, inventoryUsage } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Record usage and decrease stock
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id, itemId, itemType, date, quantity, weightKg, purpose, notes, recordedBy
    } = body;

    if (!itemId || !itemType || !date || !quantity) {
      return NextResponse.json(
        { error: 'Item ID, item type, date, and quantity are required' },
        { status: 400 }
      );
    }

    if (itemType !== 'feed' && itemType !== 'asset') {
      return NextResponse.json(
        { error: 'Item type must be "feed" or "asset"' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const usageRecord = {
      id,
      itemId,
      itemType,
      date,
      quantity: Number(quantity),
      weightKg: weightKg ? String(weightKg) : null,
      purpose: purpose || null,
      notes: notes || null,
      recordedBy: recordedBy || null,
    };

    // Insert usage record
    await db.insert(inventoryUsage).values(usageRecord);

    // If it's feed inventory, decrease current stock
    if (itemType === 'feed') {
      const feedItem = await db.select().from(feedInventory).where(eq(feedInventory.id, itemId)).limit(1);

      if (feedItem.length > 0 && feedItem[0].currentStock !== null) {
        const newStock = Math.max(0, feedItem[0].currentStock - Number(quantity));
        await db.update(feedInventory)
          .set({ currentStock: newStock, updatedAt: now })
          .where(eq(feedInventory.id, itemId));
      }
    }

    return NextResponse.json(usageRecord, { status: 201 });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}

// Get usage history for an item
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'Item ID and item type are required' },
        { status: 400 }
      );
    }

    const usageRecords = await db.select()
      .from(inventoryUsage)
      .where(eq(inventoryUsage.itemId, itemId))
      .orderBy(inventoryUsage.date);

    return NextResponse.json(usageRecords);
  } catch (error) {
    console.error('Error fetching usage records:', error);
    return NextResponse.json({ error: 'Failed to fetch usage records' }, { status: 500 });
  }
}

// Delete usage record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Usage record ID is required' }, { status: 400 });
    }

    await db.delete(inventoryUsage).where(eq(inventoryUsage.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting usage record:', error);
    return NextResponse.json({ error: 'Failed to delete usage record' }, { status: 500 });
  }
}
