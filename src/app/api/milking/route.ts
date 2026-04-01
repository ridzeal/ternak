import { NextResponse } from 'next/server';
import { db } from '@/db';
import { milkingRecords } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const records = await db.select().from(milkingRecords).orderBy(milkingRecords.date);
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching milking records:', error);
    return NextResponse.json({ error: 'Failed to fetch milking records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, cowId, cowName, date, session, volume, fat, protein, lactose, totalSolids, notes } = body;

    if (!cowId) {
      return NextResponse.json({ error: 'Cow ID is required' }, { status: 400 });
    }

    // Volume is required, but can be 0 (e.g., for notes-only records)
    if (volume === undefined || volume === null) {
      return NextResponse.json({ error: 'Volume is required' }, { status: 400 });
    }

    const newRecord = {
      id,
      cowId,
      cowName,
      date,
      session: session as 'Pagi' | 'Siang' | 'Malam',
      volume: String(volume),
      fat: String(fat || 0),
      protein: String(protein || 0),
      lactose: lactose ? String(lactose) : null,
      totalSolids: totalSolids ? String(totalSolids) : null,
      notes: notes || null,
    };

    await db.insert(milkingRecords).values(newRecord);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating milking record:', error);
    return NextResponse.json({ error: 'Failed to create milking record' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, cowId, cowName, date, session, volume, fat, protein, lactose, totalSolids, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    // Volume is required, but can be 0 (e.g., for notes-only records)
    if (volume === undefined || volume === null) {
      return NextResponse.json({ error: 'Volume is required' }, { status: 400 });
    }

    const updatedRecord = {
      id,
      cowId,
      cowName,
      date,
      session: session as 'Pagi' | 'Siang' | 'Malam',
      volume: String(volume),
      fat: String(fat || 0),
      protein: String(protein || 0),
      lactose: lactose ? String(lactose) : null,
      totalSolids: totalSolids ? String(totalSolids) : null,
      notes: notes || null,
    };

    await db.update(milkingRecords).set(updatedRecord).where(eq(milkingRecords.id, id));

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating milking record:', error);
    return NextResponse.json({ error: 'Failed to update milking record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    await db.delete(milkingRecords).where(eq(milkingRecords.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting milking record:', error);
    return NextResponse.json({ error: 'Failed to delete milking record' }, { status: 500 });
  }
}
