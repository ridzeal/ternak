import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets } from '@/db/schema';

export async function GET() {
  try {
    const allAssets = await db.select().from(assets);

    const stats = {
      total: allAssets.length,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalQuantity: 0,
    };

    allAssets.forEach((asset) => {
      // Count by category
      const category = asset.category || 'Uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count by status
      const status = asset.status || 'Active';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Sum quantity
      stats.totalQuantity += asset.quantity || 0;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching asset stats:', error);
    return NextResponse.json({ error: 'Failed to fetch asset stats' }, { status: 500 });
  }
}
