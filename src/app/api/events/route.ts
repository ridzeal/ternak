import { NextResponse } from 'next/server';
import { db } from '@/db';
import { farmEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const events = await db.select().from(farmEvents).orderBy(farmEvents.date);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching farm events:', error);
    return NextResponse.json({ error: 'Failed to fetch farm events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, cowId, cowName, date, type, description, vet, followUp } = body;

    if (!cowId || !description) {
      return NextResponse.json({ error: 'Cow ID and description are required' }, { status: 400 });
    }

    const newEvent = {
      id,
      cowId,
      cowName,
      date,
      type: type as 'Pemeriksaan Kesehatan' | 'Pengawinan' | 'Penimbangan' | 'Vaksinasi' | 'Pengobatan' | 'Melahirkan' | 'Pemberian Cacing' | 'Pemotongan Kuku',
      description,
      vet: vet || '-',
      followUp: followUp || '-',
    };

    await db.insert(farmEvents).values(newEvent);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating farm event:', error);
    return NextResponse.json({ error: 'Failed to create farm event' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, cowId, cowName, date, type, description, vet, followUp } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const updatedEvent = {
      id,
      cowId,
      cowName,
      date,
      type: type as 'Pemeriksaan Kesehatan' | 'Pengawinan' | 'Penimbangan' | 'Vaksinasi' | 'Pengobatan' | 'Melahirkan' | 'Pemberian Cacing' | 'Pemotongan Kuku',
      description,
      vet: vet || '-',
      followUp: followUp || '-',
    };

    await db.update(farmEvents).set(updatedEvent).where(eq(farmEvents.id, id));

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating farm event:', error);
    return NextResponse.json({ error: 'Failed to update farm event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    await db.delete(farmEvents).where(eq(farmEvents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting farm event:', error);
    return NextResponse.json({ error: 'Failed to delete farm event' }, { status: 500 });
  }
}
