import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cows } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allCows = await db.select().from(cows).orderBy(cows.id);
    return NextResponse.json(allCows);
  } catch (error) {
    console.error('Error fetching cows:', error);
    return NextResponse.json({ error: 'Failed to fetch cows' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, breed, dob, gender, weight, status, tag, sire, dam, length, chestCircumference, reproductiveNotes } = body;

    if (!name || !tag || !dob) {
      return NextResponse.json({ error: 'Name, tag, and date of birth are required' }, { status: 400 });
    }

    const newCow = {
      id,
      name,
      breed,
      dob,
      gender: gender as 'Betina' | 'Jantan',
      weight: Number(weight),
      status: status as 'Laktasi' | 'Kering' | 'Hamil' | 'Aktif' | 'Karantina' | 'Terjual',
      tag,
      sire: sire || null,
      dam: dam || null,
      length: length ? Number(length) : null,
      chestCircumference: chestCircumference ? Number(chestCircumference) : null,
      reproductiveNotes: reproductiveNotes || null,
    };

    await db.insert(cows).values(newCow);

    return NextResponse.json(newCow, { status: 201 });
  } catch (error) {
    console.error('Error creating cow:', error);
    return NextResponse.json({ error: 'Failed to create cow' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, breed, dob, gender, weight, status, tag, sire, dam, length, chestCircumference, reproductiveNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Cow ID is required' }, { status: 400 });
    }

    const updatedCow = {
      id,
      name,
      breed,
      dob,
      gender: gender as 'Betina' | 'Jantan',
      weight: Number(weight),
      status: status as 'Laktasi' | 'Kering' | 'Hamil' | 'Aktif' | 'Karantina' | 'Terjual',
      tag,
      sire: sire || null,
      dam: dam || null,
      length: length ? Number(length) : null,
      chestCircumference: chestCircumference ? Number(chestCircumference) : null,
      reproductiveNotes: reproductiveNotes || null,
    };

    await db.update(cows).set(updatedCow).where(eq(cows.id, id));

    return NextResponse.json(updatedCow);
  } catch (error) {
    console.error('Error updating cow:', error);
    return NextResponse.json({ error: 'Failed to update cow' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Cow ID is required' }, { status: 400 });
    }

    await db.delete(cows).where(eq(cows.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cow:', error);
    return NextResponse.json({ error: 'Failed to delete cow' }, { status: 500 });
  }
}
