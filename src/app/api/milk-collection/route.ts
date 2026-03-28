import { NextResponse } from 'next/server';
import { db } from '@/db';
import { milkCollection } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const records = await db.select().from(milkCollection).where(eq(milkCollection.date, date)).orderBy(desc(milkCollection.date));
      return NextResponse.json(records);
    }

    const records = await db.select().from(milkCollection).orderBy(desc(milkCollection.date));
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching milk collection records:', error);
    return NextResponse.json({ error: 'Failed to fetch milk collection records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, date, buyerName, totalQuantity, fatAverage, proteinAverage, notes } = body;

    if (!date || !buyerName || !totalQuantity) {
      return NextResponse.json({ error: 'Date, buyer name, and total quantity are required' }, { status: 400 });
    }

    const newRecord = {
      id: id || `mc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date,
      buyerName,
      totalQuantity: String(totalQuantity),
      fatAverage: fatAverage ? String(fatAverage) : null,
      proteinAverage: proteinAverage ? String(proteinAverage) : null,
      notes: notes || null,
    };

    await db.insert(milkCollection).values(newRecord);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating milk collection record:', error);
    return NextResponse.json({ error: 'Failed to create milk collection record' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, date, buyerName, totalQuantity, fatAverage, proteinAverage, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const updatedRecord = {
      id,
      date,
      buyerName,
      totalQuantity: String(totalQuantity),
      fatAverage: fatAverage ? String(fatAverage) : null,
      proteinAverage: proteinAverage ? String(proteinAverage) : null,
      notes: notes || null,
    };

    await db.update(milkCollection).set(updatedRecord).where(eq(milkCollection.id, id));

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating milk collection record:', error);
    return NextResponse.json({ error: 'Failed to update milk collection record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    await db.delete(milkCollection).where(eq(milkCollection.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting milk collection record:', error);
    return NextResponse.json({ error: 'Failed to delete milk collection record' }, { status: 500 });
  }
}
