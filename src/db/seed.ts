import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { cows, milkingRecords, farmEvents } from './schema';

async function seed() {
  console.log('Connecting to:', process.env.POSTGRES_URL);

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL!,
  });

  const db = drizzle(pool);

  // Seed cows
  const initCows: { id: string; name: string; breed: string; dob: string; gender: 'Betina' | 'Jantan'; weight: number; status: 'Laktasi' | 'Kering' | 'Hamil' | 'Aktif' | 'Karantina' | 'Terjual'; tag: string; sire: string | null; dam: string | null }[] = [
    { id: 'C-001', name: 'Mentari', breed: 'Friesian Holstein', dob: '2020-03-12', gender: 'Betina', weight: 480, status: 'Laktasi', tag: 'FH-4821', sire: null, dam: null },
    { id: 'C-002', name: 'Melati', breed: 'Limousin', dob: '2019-07-04', gender: 'Betina', weight: 510, status: 'Kering', tag: 'LM-2219', sire: null, dam: null },
    { id: 'C-003', name: 'Bumi', breed: 'Simmental', dob: '2021-01-20', gender: 'Jantan', weight: 620, status: 'Aktif', tag: 'SM-3301', sire: null, dam: null },
  ];

  // Seed milking records
  const initMilking: { id: string; cowId: string; cowName: string; date: string; session: 'Pagi' | 'Siang' | 'Malam'; volume: string; fat: string; protein: string; notes: string | null }[] = [
    { id: 'M-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Pagi', volume: '12.5', fat: '3.8', protein: '3.2', notes: '' },
    { id: 'M-002', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Malam', volume: '10.2', fat: '3.9', protein: '3.1', notes: 'Sedikit kurang dari biasanya' },
    { id: 'M-003', cowId: 'C-002', cowName: 'Melati', date: '2024-11-19', session: 'Pagi', volume: '14.1', fat: '4.1', protein: '3.4', notes: '' },
  ];

  // Seed events
  const initEvents: { id: string; cowId: string; cowName: string; date: string; type: 'Pemeriksaan Kesehatan' | 'Pengawinan' | 'Penimbangan' | 'Vaksinasi' | 'Pengobatan' | 'Melahirkan' | 'Pemberian Cacing' | 'Pemotongan Kuku'; description: string; vet: string; followUp: string }[] = [
    { id: 'E-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-15', type: 'Pemeriksaan Kesehatan', description: 'Vaksinasi rutin - booster FMD', vet: 'drh. Santoso', followUp: '2024-12-15' },
    { id: 'E-002', cowId: 'C-002', cowName: 'Melati', date: '2024-11-10', type: 'Pengawinan', description: 'Inseminasi buatan dilakukan', vet: 'drh. Lestari', followUp: '2024-12-10' },
    { id: 'E-003', cowId: 'C-003', cowName: 'Bumi', date: '2024-11-08', type: 'Penimbangan', description: 'Penimbangan bulanan - naik 12kg', vet: '-', followUp: '-' },
  ];

  console.log('Seeding database...');

  // Insert cows
  for (const cow of initCows) {
    await db.insert(cows).values(cow).onConflictDoNothing({ target: cows.id }).execute();
  }
  console.log(`✓ Inserted ${initCows.length} cows`);

  // Insert milking records
  for (const record of initMilking) {
    await db.insert(milkingRecords).values(record).onConflictDoNothing({ target: milkingRecords.id }).execute();
  }
  console.log(`✓ Inserted ${initMilking.length} milking records`);

  // Insert events
  for (const event of initEvents) {
    await db.insert(farmEvents).values(event).onConflictDoNothing({ target: farmEvents.id }).execute();
  }
  console.log(`✓ Inserted ${initEvents.length} farm events`);

  console.log('Database seeded successfully!');

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
