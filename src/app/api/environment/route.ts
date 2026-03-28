import { NextResponse } from 'next/server';
import { db } from '@/db';
import { environmentalData } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Calculate Temperature Humidity Index (THI)
// Formula: THI = (0.8 × T) + ((RH/100) × (T - 14.4)) + 46.4
// where T is temperature in °C and RH is relative humidity in %
function calculateTHI(temp: number, humidity: number): number {
  const thi = (0.8 * temp) + ((humidity / 100) * (temp - 14.4)) + 46.4;
  return Math.round(thi * 10) / 10; // Round to 1 decimal place
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const records = await db.select().from(environmentalData).where(eq(environmentalData.date, date));
      return NextResponse.json(records);
    }

    const records = await db.select().from(environmentalData).orderBy(desc(environmentalData.date));
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching environmental data:', error);
    return NextResponse.json({ error: 'Failed to fetch environmental data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, date, tempMin, tempMax, humidity, thi, thunderstorm, notes } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Auto-calculate THI if temp and humidity are provided
    let calculatedTHI = thi;
    if (tempMax && humidity && !thi) {
      calculatedTHI = calculateTHI(Number(tempMax), Number(humidity));
    }

    // Check if record for this date already exists
    const existingRecord = await db.select().from(environmentalData).where(eq(environmentalData.date, date)).limit(1);

    if (existingRecord && existingRecord.length > 0) {
      // Update existing record - preserve the existing ID
      await db.update(environmentalData)
        .set({
          tempMin: tempMin ? String(tempMin) : null,
          tempMax: tempMax ? String(tempMax) : null,
          humidity: humidity ? Number(humidity) : null,
          thi: calculatedTHI ? String(calculatedTHI) : null,
          thunderstorm: thunderstorm || false,
          notes: notes || null,
        })
        .where(eq(environmentalData.date, date));

      // Return the existing record with its original ID
      return NextResponse.json({
        id: existingRecord[0].id,
        date,
        tempMin: tempMin ? String(tempMin) : null,
        tempMax: tempMax ? String(tempMax) : null,
        humidity: humidity ? Number(humidity) : null,
        thi: calculatedTHI ? String(calculatedTHI) : null,
        thunderstorm: thunderstorm || false,
        notes: notes || null,
      }, { status: 200 });
    } else {
      // Insert new record
      const newRecord = {
        id: id || `env_${date}`,
        date,
        tempMin: tempMin ? String(tempMin) : null,
        tempMax: tempMax ? String(tempMax) : null,
        humidity: humidity ? Number(humidity) : null,
        thi: calculatedTHI ? String(calculatedTHI) : null,
        thunderstorm: thunderstorm || false,
        notes: notes || null,
      };

      await db.insert(environmentalData).values(newRecord);
      return NextResponse.json(newRecord, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating environmental record:', error);
    return NextResponse.json({ error: 'Failed to create environmental record' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, date, tempMin, tempMax, humidity, thi, thunderstorm, notes } = body;

    if (!id && !date) {
      return NextResponse.json({ error: 'ID or date is required' }, { status: 400 });
    }

    // Auto-calculate THI if temp and humidity are provided
    let calculatedTHI = thi;
    if (tempMax && humidity && !thi) {
      calculatedTHI = calculateTHI(Number(tempMax), Number(humidity));
    }

    const updatedRecord = {
      date,
      tempMin: tempMin ? String(tempMin) : null,
      tempMax: tempMax ? String(tempMax) : null,
      humidity: humidity ? Number(humidity) : null,
      thi: calculatedTHI ? String(calculatedTHI) : null,
      thunderstorm: thunderstorm || false,
      notes: notes || null,
    };

    if (id) {
      await db.update(environmentalData).set(updatedRecord).where(eq(environmentalData.id, id));
    } else if (date) {
      await db.update(environmentalData).set(updatedRecord).where(eq(environmentalData.date, date));
    }

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating environmental record:', error);
    return NextResponse.json({ error: 'Failed to update environmental record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    await db.delete(environmentalData).where(eq(environmentalData.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting environmental record:', error);
    return NextResponse.json({ error: 'Failed to delete environmental record' }, { status: 500 });
  }
}
