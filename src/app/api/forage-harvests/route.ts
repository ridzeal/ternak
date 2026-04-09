import { NextResponse } from 'next/server';
import { db } from '@/db';
import { forageHarvests, landPlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plotId = searchParams.get('plotId');

    if (plotId) {
      const harvests = await db.select()
        .from(forageHarvests)
        .where(eq(forageHarvests.plotId, plotId))
        .orderBy(forageHarvests.harvestDate);
      return NextResponse.json(harvests);
    }

    const allHarvests = await db.select()
      .from(forageHarvests)
      .orderBy(forageHarvests.harvestDate);
    return NextResponse.json(allHarvests);
  } catch (error) {
    console.error('Error fetching forage harvests:', error);
    return NextResponse.json({ error: 'Failed to fetch forage harvests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id, plotId, plotName, harvestDate, cutNumber, quantity,
      quantityUnit, quality, height, heightUnit, usedFor,
      storageLocation, notes
    } = body;

    if (!plotId || !plotName || !harvestDate || !cutNumber) {
      return NextResponse.json(
        { error: 'Plot ID, plot name, harvest date, and cut number are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newHarvest = {
      id,
      plotId,
      plotName,
      harvestDate,
      cutNumber: Number(cutNumber),
      quantity: quantity ? String(quantity) : null,
      quantityUnit: quantityUnit || null,
      quality: quality || null,
      height: height ? String(height) : null,
      heightUnit: heightUnit || null,
      usedFor: usedFor || null,
      storageLocation: storageLocation || null,
      notes: notes || null,
      createdAt: now,
    };

    await db.insert(forageHarvests).values(newHarvest);

    // Update the plot's cut cycle and status
    await db.update(landPlots).set({
      currentCutCycle: Number(cutNumber),
      lastCutDate: harvestDate,
      status: 'Growing',
      updatedAt: now,
    }).where(eq(landPlots.id, plotId));

    return NextResponse.json(newHarvest, { status: 201 });
  } catch (error) {
    console.error('Error creating forage harvest:', error);
    return NextResponse.json({ error: 'Failed to create forage harvest' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id, plotId, plotName, harvestDate, cutNumber, quantity,
      quantityUnit, quality, height, heightUnit, usedFor,
      storageLocation, notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Harvest record ID is required' }, { status: 400 });
    }

    const updatedHarvest: Record<string, any> = { id };
    if (plotId !== undefined) updatedHarvest.plotId = plotId;
    if (plotName !== undefined) updatedHarvest.plotName = plotName;
    if (harvestDate !== undefined) updatedHarvest.harvestDate = harvestDate;
    if (cutNumber !== undefined) updatedHarvest.cutNumber = Number(cutNumber);
    if (quantity !== undefined) updatedHarvest.quantity = quantity ? String(quantity) : null;
    if (quantityUnit !== undefined) updatedHarvest.quantityUnit = quantityUnit || null;
    if (quality !== undefined) updatedHarvest.quality = quality || null;
    if (height !== undefined) updatedHarvest.height = height ? String(height) : null;
    if (heightUnit !== undefined) updatedHarvest.heightUnit = heightUnit || null;
    if (usedFor !== undefined) updatedHarvest.usedFor = usedFor || null;
    if (storageLocation !== undefined) updatedHarvest.storageLocation = storageLocation || null;
    if (notes !== undefined) updatedHarvest.notes = notes || null;

    await db.update(forageHarvests).set(updatedHarvest).where(eq(forageHarvests.id, id));
    return NextResponse.json(updatedHarvest);
  } catch (error) {
    console.error('Error updating forage harvest:', error);
    return NextResponse.json({ error: 'Failed to update forage harvest' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Harvest record ID is required' }, { status: 400 });
    }

    await db.delete(forageHarvests).where(eq(forageHarvests.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting forage harvest:', error);
    return NextResponse.json({ error: 'Failed to delete forage harvest' }, { status: 500 });
  }
}
