import { NextResponse } from 'next/server';
import { db } from '@/db';
import { landPlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const cropType = searchParams.get('cropType');
    const readyToHarvest = searchParams.get('ready');

    let query = db.select().from(landPlots);

    if (readyToHarvest === 'true') {
      const allPlots = await query;
      const ready = allPlots.filter(p => p.status === 'Ready');
      return NextResponse.json(ready);
    }

    if (status && cropType) {
      const plots = await query.where(
        eq(landPlots.status, status as any)
      );
      return NextResponse.json(plots.filter(p => p.cropType === cropType));
    } else if (status) {
      const plots = await query.where(eq(landPlots.status, status as any));
      return NextResponse.json(plots);
    } else if (cropType) {
      const plots = await query.where(eq(landPlots.cropType, cropType as any));
      return NextResponse.json(plots);
    }

    const allPlots = await query.orderBy(landPlots.plotName);
    return NextResponse.json(allPlots);
  } catch (error) {
    console.error('Error fetching land plots:', error);
    return NextResponse.json({ error: 'Failed to fetch land plots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id, plotName, location, area, areaUnit, cropType, cropVariety,
      plantingDate, currentCutCycle, lastCutDate, nextCutDate,
      status, assignedTo, barnLocation, notes
    } = body;

    if (!plotName) {
      return NextResponse.json({ error: 'Plot name is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newPlot = {
      id,
      plotName,
      location: location || null,
      area: area ? String(area) : null,
      areaUnit: areaUnit || null,
      cropType: cropType || null,
      cropVariety: cropVariety || null,
      plantingDate: plantingDate || null,
      currentCutCycle: currentCutCycle ? Number(currentCutCycle) : null,
      lastCutDate: lastCutDate || null,
      nextCutDate: nextCutDate || null,
      status: status || 'Growing',
      assignedTo: assignedTo || null,
      barnLocation: barnLocation || null,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(landPlots).values(newPlot);
    return NextResponse.json(newPlot, { status: 201 });
  } catch (error) {
    console.error('Error creating land plot:', error);
    return NextResponse.json({ error: 'Failed to create land plot' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id, plotName, location, area, areaUnit, cropType, cropVariety,
      plantingDate, currentCutCycle, lastCutDate, nextCutDate,
      status, assignedTo, barnLocation, notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Land plot ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updatedPlot: Record<string, any> = { id, updatedAt: now };

    if (plotName !== undefined) updatedPlot.plotName = plotName;
    if (location !== undefined) updatedPlot.location = location || null;
    if (area !== undefined) updatedPlot.area = area ? String(area) : null;
    if (areaUnit !== undefined) updatedPlot.areaUnit = areaUnit || null;
    if (cropType !== undefined) updatedPlot.cropType = cropType || null;
    if (cropVariety !== undefined) updatedPlot.cropVariety = cropVariety || null;
    if (plantingDate !== undefined) updatedPlot.plantingDate = plantingDate || null;
    if (currentCutCycle !== undefined) updatedPlot.currentCutCycle = currentCutCycle ? Number(currentCutCycle) : null;
    if (lastCutDate !== undefined) updatedPlot.lastCutDate = lastCutDate || null;
    if (nextCutDate !== undefined) updatedPlot.nextCutDate = nextCutDate || null;
    if (status !== undefined) updatedPlot.status = status || 'Growing';
    if (assignedTo !== undefined) updatedPlot.assignedTo = assignedTo || null;
    if (barnLocation !== undefined) updatedPlot.barnLocation = barnLocation || null;
    if (notes !== undefined) updatedPlot.notes = notes || null;

    await db.update(landPlots).set(updatedPlot).where(eq(landPlots.id, id));
    return NextResponse.json(updatedPlot);
  } catch (error) {
    console.error('Error updating land plot:', error);
    return NextResponse.json({ error: 'Failed to update land plot' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Land plot ID is required' }, { status: 400 });
    }

    await db.delete(landPlots).where(eq(landPlots.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting land plot:', error);
    return NextResponse.json({ error: 'Failed to delete land plot' }, { status: 500 });
  }
}
