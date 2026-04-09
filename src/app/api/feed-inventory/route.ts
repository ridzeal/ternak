import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedInventory } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('lowStock');

    let query = db.select().from(feedInventory).orderBy(feedInventory.name);

    const allFeed = await query;

    // Filter low stock if requested
    if (lowStock === 'true') {
      const lowStockItems = allFeed.filter(
        (item) => item.currentStock !== null && item.minStock !== null && item.currentStock <= item.minStock
      );
      return NextResponse.json(lowStockItems);
    }

    return NextResponse.json(allFeed);
  } catch (error) {
    console.error('Error fetching feed inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch feed inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id, name, purchaseDate, quantity, weightKg, unit,
      unitPrice, totalPrice, expiryDate, supplier, notes,
      currentStock, minStock
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newFeed = {
      id,
      name,
      purchaseDate: purchaseDate || null,
      quantity: quantity ? Number(quantity) : null,
      weightKg: weightKg ? String(weightKg) : null,
      unit: unit || null,
      unitPrice: unitPrice ? String(unitPrice) : null,
      totalPrice: totalPrice ? String(totalPrice) : null,
      expiryDate: expiryDate || null,
      supplier: supplier || null,
      notes: notes || null,
      currentStock: currentStock ? Number(currentStock) : (quantity ? Number(quantity) : null),
      minStock: minStock ? Number(minStock) : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(feedInventory).values(newFeed);

    return NextResponse.json(newFeed, { status: 201 });
  } catch (error) {
    console.error('Error creating feed inventory:', error);
    return NextResponse.json({ error: 'Failed to create feed inventory' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id, name, purchaseDate, quantity, weightKg, unit,
      unitPrice, totalPrice, expiryDate, supplier, notes,
      currentStock, minStock
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Feed inventory ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updatedFeed = {
      id,
      name,
      purchaseDate: purchaseDate || null,
      quantity: quantity ? Number(quantity) : null,
      weightKg: weightKg ? String(weightKg) : null,
      unit: unit || null,
      unitPrice: unitPrice ? String(unitPrice) : null,
      totalPrice: totalPrice ? String(totalPrice) : null,
      expiryDate: expiryDate || null,
      supplier: supplier || null,
      notes: notes || null,
      currentStock: currentStock !== undefined && currentStock !== null ? Number(currentStock) : undefined,
      minStock: minStock ? Number(minStock) : null,
      updatedAt: now,
    };

    // Remove undefined fields
    const cleanData = Object.fromEntries(
      Object.entries(updatedFeed).filter(([_, v]) => v !== undefined)
    );

    await db.update(feedInventory).set(cleanData).where(eq(feedInventory.id, id));

    return NextResponse.json(updatedFeed);
  } catch (error) {
    console.error('Error updating feed inventory:', error);
    return NextResponse.json({ error: 'Failed to update feed inventory' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Feed inventory ID is required' }, { status: 400 });
    }

    await db.delete(feedInventory).where(eq(feedInventory.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feed inventory:', error);
    return NextResponse.json({ error: 'Failed to delete feed inventory' }, { status: 500 });
  }
}
