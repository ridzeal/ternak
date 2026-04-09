import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assetMaintenance } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    const query = db.select().from(assetMaintenance);

    const records = assetId 
      ? await query.where(eq(assetMaintenance.assetId, assetId)).orderBy(assetMaintenance.date)
      : await query.orderBy(assetMaintenance.date);

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, assetId, date, type, description, cost, vendor, nextMaintenance, notes } = body;

    if (!assetId || !date || !type || !description) {
      return NextResponse.json(
        { error: 'Asset ID, date, type, and description are required' },
        { status: 400 }
      );
    }

    const newRecord = {
      id,
      assetId,
      date,
      type: type as 'Routine' | 'Repair' | 'Inspection' | 'Replacement',
      description,
      cost: cost ? String(cost) : null,
      vendor: vendor || null,
      nextMaintenance: nextMaintenance || null,
      notes: notes || null,
    };

    await db.insert(assetMaintenance).values(newRecord);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, assetId, date, type, description, cost, vendor, nextMaintenance, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Maintenance record ID is required' }, { status: 400 });
    }

    const updatedRecord = {
      id,
      assetId: assetId || undefined,
      date: date || undefined,
      type: type ? type as 'Routine' | 'Repair' | 'Inspection' | 'Replacement' : undefined,
      description: description || undefined,
      cost: cost ? String(cost) : undefined,
      vendor: vendor !== undefined ? vendor : undefined,
      nextMaintenance: nextMaintenance !== undefined ? nextMaintenance : undefined,
      notes: notes !== undefined ? notes : undefined,
    };

    // Remove undefined fields
    const cleanData = Object.fromEntries(
      Object.entries(updatedRecord).filter(([_, v]) => v !== undefined)
    );

    await db.update(assetMaintenance).set(cleanData).where(eq(assetMaintenance.id, id));

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    return NextResponse.json({ error: 'Failed to update maintenance record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Maintenance record ID is required' }, { status: 400 });
    }

    await db.delete(assetMaintenance).where(eq(assetMaintenance.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance record' }, { status: 500 });
  }
}
