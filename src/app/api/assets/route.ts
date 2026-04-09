import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query with optional filters
    if (category && status) {
      const allAssets = await db.select()
        .from(assets)
        .where(eq(assets.category, category as any))
        .orderBy(assets.name);
      return NextResponse.json(allAssets);
    } else if (category) {
      const allAssets = await db.select()
        .from(assets)
        .where(eq(assets.category, category as any))
        .orderBy(assets.name);
      return NextResponse.json(allAssets);
    } else if (status) {
      const allAssets = await db.select()
        .from(assets)
        .where(eq(assets.status, status as any))
        .orderBy(assets.name);
      return NextResponse.json(allAssets);
    } else {
      const allAssets = await db.select()
        .from(assets)
        .orderBy(assets.name);
      return NextResponse.json(allAssets);
    }
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, purchaseDate, quantity, unit, notes, status } = body;

    if (!name || quantity === undefined || quantity === null) {
      return NextResponse.json({ error: 'Name and quantity are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newAsset = {
      id,
      name,
      category: category || null,
      purchaseDate: purchaseDate || null,
      quantity: Number(quantity),
      unit: unit || null,
      notes: notes || null,
      status: status || 'Active',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(assets).values(newAsset);

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, purchaseDate, quantity, unit, notes, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updatedAsset = {
      id,
      name,
      category: category || null,
      purchaseDate: purchaseDate || null,
      quantity: quantity ? Number(quantity) : 0,
      unit: unit || null,
      notes: notes || null,
      status: status || 'Active',
      updatedAt: now,
    };

    await db.update(assets).set(updatedAsset).where(eq(assets.id, id));

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    await db.delete(assets).where(eq(assets.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
