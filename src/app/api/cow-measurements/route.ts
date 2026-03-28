import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cowMeasurements } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cowId = searchParams.get('cowId');

    if (!cowId) {
      return NextResponse.json({ error: 'cowId parameter is required' }, { status: 400 });
    }

    const measurements = await db
      .select()
      .from(cowMeasurements)
      .where(eq(cowMeasurements.cowId, cowId))
      .orderBy(desc(cowMeasurements.date));

    return NextResponse.json(measurements);
  } catch (error) {
    console.error('Error fetching cow measurements:', error);
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, cowId, date, weight, length, chestCircumference, notes } = body;

    if (!cowId || !date || !weight) {
      return NextResponse.json({ error: 'Cow ID, date, and weight are required' }, { status: 400 });
    }

    const newMeasurement = {
      id: id || `cm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cowId,
      date,
      weight: Number(weight),
      length: length ? Number(length) : null,
      chestCircumference: chestCircumference ? Number(chestCircumference) : null,
      notes: notes || null,
    };

    await db.insert(cowMeasurements).values(newMeasurement);

    return NextResponse.json(newMeasurement, { status: 201 });
  } catch (error) {
    console.error('Error creating measurement:', error);
    return NextResponse.json({ error: 'Failed to create measurement' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Measurement ID is required' }, { status: 400 });
    }

    await db.delete(cowMeasurements).where(eq(cowMeasurements.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return NextResponse.json({ error: 'Failed to delete measurement' }, { status: 500 });
  }
}
