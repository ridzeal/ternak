import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reproductiveEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cowId = searchParams.get('cowId');
    const eventType = searchParams.get('eventType');
    const upcoming = searchParams.get('upcoming');

    if (upcoming === 'true') {
      const allEvents = await db.select().from(reproductiveEvents);
      const today = new Date().toISOString().split('T')[0];
      const upcomingEvents = allEvents.filter(e => e.expectedDate && e.expectedDate >= today);
      return NextResponse.json(upcomingEvents.sort((a, b) => (a.expectedDate || '').localeCompare(b.expectedDate || '')));
    }

    if (cowId) {
      const events = await db.select()
        .from(reproductiveEvents)
        .where(eq(reproductiveEvents.cowId, cowId))
        .orderBy(reproductiveEvents.eventDate);
      return NextResponse.json(events);
    }

    if (eventType) {
      const events = await db.select()
        .from(reproductiveEvents)
        .where(eq(reproductiveEvents.eventType, eventType as any))
        .orderBy(reproductiveEvents.eventDate);
      return NextResponse.json(events);
    }

    const allEvents = await db.select().from(reproductiveEvents).orderBy(reproductiveEvents.eventDate);
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Error fetching reproductive events:', error);
    return NextResponse.json({ error: 'Failed to fetch reproductive events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id, cowId, cowName, eventType, eventDate, expectedDate, actualDate,
      semenId, semenSource, technician,
      pregnancyStatus, pregnancyDays,
      calfGender, calfWeight, calvingEase,
      status, notes
    } = body;

    if (!cowId || !cowName || !eventType || !eventDate) {
      return NextResponse.json(
        { error: 'Cow ID, cow name, event type, and event date are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newEvent = {
      id,
      cowId,
      cowName,
      eventType,
      eventDate,
      expectedDate: expectedDate || null,
      actualDate: actualDate || null,
      semenId: semenId || null,
      semenSource: semenSource || null,
      technician: technician || null,
      pregnancyStatus: pregnancyStatus || null,
      pregnancyDays: pregnancyDays ? Number(pregnancyDays) : null,
      calfGender: calfGender || null,
      calfWeight: calfWeight ? String(calfWeight) : null,
      calvingEase: calvingEase || null,
      status: status || 'Active',
      notes: notes || null,
      createdAt: now,
    };

    await db.insert(reproductiveEvents).values(newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating reproductive event:', error);
    return NextResponse.json({ error: 'Failed to create reproductive event' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const updatedEvent: Record<string, any> = { id };
    if (updates.cowId !== undefined) updatedEvent.cowId = updates.cowId;
    if (updates.cowName !== undefined) updatedEvent.cowName = updates.cowName;
    if (updates.eventType !== undefined) updatedEvent.eventType = updates.eventType;
    if (updates.eventDate !== undefined) updatedEvent.eventDate = updates.eventDate;
    if (updates.expectedDate !== undefined) updatedEvent.expectedDate = updates.expectedDate || null;
    if (updates.actualDate !== undefined) updatedEvent.actualDate = updates.actualDate || null;
    if (updates.semenId !== undefined) updatedEvent.semenId = updates.semenId || null;
    if (updates.semenSource !== undefined) updatedEvent.semenSource = updates.semenSource || null;
    if (updates.technician !== undefined) updatedEvent.technician = updates.technician || null;
    if (updates.pregnancyStatus !== undefined) updatedEvent.pregnancyStatus = updates.pregnancyStatus || null;
    if (updates.pregnancyDays !== undefined) updatedEvent.pregnancyDays = updates.pregnancyDays ? Number(updates.pregnancyDays) : null;
    if (updates.calfGender !== undefined) updatedEvent.calfGender = updates.calfGender || null;
    if (updates.calfWeight !== undefined) updatedEvent.calfWeight = updates.calfWeight ? String(updates.calfWeight) : null;
    if (updates.calvingEase !== undefined) updatedEvent.calvingEase = updates.calvingEase || null;
    if (updates.status !== undefined) updatedEvent.status = updates.status || 'Active';
    if (updates.notes !== undefined) updatedEvent.notes = updates.notes || null;

    await db.update(reproductiveEvents).set(updatedEvent).where(eq(reproductiveEvents.id, id));
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating reproductive event:', error);
    return NextResponse.json({ error: 'Failed to update reproductive event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    await db.delete(reproductiveEvents).where(eq(reproductiveEvents.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reproductive event:', error);
    return NextResponse.json({ error: 'Failed to delete reproductive event' }, { status: 500 });
  }
}
