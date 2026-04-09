import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import {
  users,
  sessions,
  cows,
  milkingRecords,
  cowMeasurements,
  environmentalData,
  milkCollection,
  farmEvents,
} from './schema';
import { hashPassword } from '../../src/lib/auth';

async function seed() {
  console.log('🌱 Starting comprehensive database seed...\n');
  console.log('Connecting to:', process.env.POSTGRES_URL);

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL!,
  });

  const db = drizzle(pool, { schema });

  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const todayStr = formatDate(today);

  // Helper to get dates relative to today
  const getDaysAgo = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return formatDate(date);
  };

  // ============================================
  // 1. USERS
  // ============================================
  console.log('\n📋 Seeding Users...');
  const seedUsers = [
    { id: 'user_admin_001', email: 'admin@farm.local', name: 'Farm Admin', role: 'admin' as const, password: 'admin123' },
    { id: 'user_manager_001', email: 'manager@farm.local', name: 'Farm Manager', role: 'manager' as const, password: 'manager123' },
    { id: 'user_worker_001', email: 'worker@farm.local', name: 'John Worker', role: 'worker' as const, password: 'worker123' },
    { id: 'user_worker_002', email: 'worker2@farm.local', name: 'Jane Worker', role: 'worker' as const, password: 'worker123' },
    { id: 'user_vet_001', email: 'vet@farm.local', name: 'drh. Santoso', role: 'worker' as const, password: 'vet123' },
  ];

  let usersCreated = 0;
  for (const user of seedUsers) {
    const exists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, user.email),
    });
    if (!exists) {
      await db.insert(users).values({
        id: user.id,
        email: user.email,
        passwordHash: hashPassword(user.password),
        name: user.name,
        role: user.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      usersCreated++;
    }
  }
  console.log(`   ✓ ${usersCreated} users created (${seedUsers.length - usersCreated} already exist)`);

  // ============================================
  // 2. COWS
  // ============================================
  console.log('\n🐄 Seeding Cows...');
  const seedCows: typeof cows.$inferInsert[] = [
    // Lactating cows (Laktasi)
    { id: 'C-001', name: 'Garut 1', breed: 'Friesian Holstein', dob: '2020-03-12', gender: 'Betina', weight: 480, status: 'Laktasi', tag: 'FH-4821', sire: 'Bumi Sr.', dam: 'Daisy', length: 150, chestCircumference: 201, reproductiveNotes: 'M4, M5 dara - Lactation 2' },
    { id: 'C-002', name: 'Garut 2', breed: 'Friesian Holstein', dob: '2019-07-04', gender: 'Betina', weight: 510, status: 'Laktasi', tag: 'FH-4822', sire: 'Champion', dam: 'Bella', length: 160, chestCircumference: 194, reproductiveNotes: 'AB1, AB3 hamil - Lactation 3' },
    { id: 'C-005', name: 'Malang 2', breed: 'Friesian Holstein', dob: '2019-11-08', gender: 'Betina', weight: 490, status: 'Laktasi', tag: 'FH-4823', sire: 'Titan', dam: 'Luna', length: 148, chestCircumference: 198, reproductiveNotes: 'Garut D melahirkan - Lactation 2' },
    { id: 'C-006', name: 'AB 1', breed: 'Friesian Holstein', dob: '2021-02-10', gender: 'Betina', weight: 475, status: 'Laktasi', tag: 'FH-4824', sire: 'King', dam: 'Princess', length: 152, chestCircumference: 203, reproductiveNotes: 'First lactation' },
    { id: 'C-009', name: 'Putri', breed: 'Jersey', dob: '2020-05-15', gender: 'Betina', weight: 420, status: 'Laktasi', tag: 'JR-1001', sire: 'Prince', dam: 'Queen', length: 140, chestCircumference: 185, reproductiveNotes: 'High butterfat producer' },
    
    // Dry cows (Kering)
    { id: 'C-003', name: 'Garut 3', breed: 'Limousin', dob: '2021-01-20', gender: 'Betina', weight: 520, status: 'Kering', tag: 'LM-2219', sire: 'Rex', dam: 'Ruby', length: 150, chestCircumference: 200, reproductiveNotes: 'AB5 keguguran - Resting' },
    { id: 'C-007', name: 'AB 2', breed: 'Limousin', dob: '2020-08-22', gender: 'Betina', weight: 530, status: 'Kering', tag: 'LM-2220', sire: 'Duke', dam: 'Duchess', length: 158, chestCircumference: 196, reproductiveNotes: 'Pre-calving rest' },
    
    // Pregnant cow (Hamil)
    { id: 'C-004', name: 'Malang 1', breed: 'Simmental', dob: '2020-06-15', gender: 'Betina', weight: 550, status: 'Hamil', tag: 'SM-3301', sire: 'Max', dam: 'Molly', length: 155, chestCircumference: 205, reproductiveNotes: 'AB6 Edema - 6 months pregnant' },
    
    // Active bull (Aktif)
    { id: 'C-008', name: 'Bumi', breed: 'Simmental', dob: '2019-04-05', gender: 'Jantan', weight: 620, status: 'Aktif', tag: 'SM-3302', sire: 'Thunder', dam: 'Storm', length: 165, chestCircumference: 215, reproductiveNotes: 'Sire bull - Main breeding stock' },
    
    // Quarantine cow (Karantina)
    { id: 'C-010', name: 'Isolasi', breed: 'Friesian Holstein', dob: '2021-06-01', gender: 'Betina', weight: 460, status: 'Karantina', tag: 'FH-4825', sire: 'Unknown', dam: 'Unknown', length: 145, chestCircumference: 190, reproductiveNotes: 'New arrival - quarantine protocol' },
    
    // Sold cow (Terjual) - for historical records
    { id: 'C-011', name: 'Mantap', breed: 'Limousin', dob: '2018-02-10', gender: 'Jantan', weight: 680, status: 'Terjual', tag: 'LM-2221', sire: 'Boss', dam: 'Lady', length: 170, chestCircumference: 220, reproductiveNotes: 'Sold for slaughter - premium weight' },
  ];

  let cowsCreated = 0;
  for (const cow of seedCows) {
    const exists = await db.query.cows.findFirst({
      where: (c, { eq }) => eq(c.tag, cow.tag!),
    });
    if (!exists) {
      await db.insert(cows).values(cow);
      cowsCreated++;
    }
  }
  console.log(`   ✓ ${cowsCreated} cows created (${seedCows.length - cowsCreated} already exist)`);

  // ============================================
  // 3. MILKING RECORDS (14 days of history)
  // ============================================
  console.log('\n🥛 Seeding Milking Records (14 days history)...');
  const sessions: Array<'Pagi' | 'Siang' | 'Malam'> = ['Pagi', 'Siang', 'Malam'];
  const lactatingCows = seedCows.filter(c => c.status === 'Laktasi');
  
  let milkingRecordsCreated = 0;
  let milkingId = 1;
  
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const date = getDaysAgo(daysAgo);
    
    for (const cow of lactatingCows) {
      // Each cow has 2-3 sessions per day
      const numSessions = daysAgo === 0 ? 2 : 3; // Today only has 2 sessions so far
      
      for (let s = 0; s < numSessions; s++) {
        const session = sessions[s];
        const recordId = `M-${String(milkingId).padStart(4, '0')}`;
        
        const exists = await db.query.milkingRecords.findFirst({
          where: (m, { and, eq }) => and(
            eq(m.cowId, cow.id!),
            eq(m.date, date),
            eq(m.session, session)
          ),
        });
        
        if (!exists) {
          // Vary the data slightly for realism
          const baseVolume = 10 + (cow.weight! / 100) * 2;
          const volumeVariation = (Math.sin(daysAgo + s) * 2).toFixed(1);
          const volume = (baseVolume + parseFloat(volumeVariation)).toFixed(1);
          
          await db.insert(milkingRecords).values({
            id: recordId,
            cowId: cow.id!,
            cowName: cow.name!,
            date,
            session,
            volume,
            fat: (3.5 + Math.random() * 0.8).toFixed(1),
            protein: (3.0 + Math.random() * 0.5).toFixed(1),
            lactose: (4.4 + Math.random() * 0.3).toFixed(1),
            totalSolids: (12.0 + Math.random() * 1.5).toFixed(1),
            notes: daysAgo === 0 && s === 0 ? 'Fresh session' : '',
          });
          milkingRecordsCreated++;
        }
        milkingId++;
      }
    }
  }
  console.log(`   ✓ ${milkingRecordsCreated} milking records created`);

  // ============================================
  // 4. COW MEASUREMENTS (monthly weight tracking)
  // ============================================
  console.log('\n📏 Seeding Cow Measurements...');
  let measurementsCreated = 0;
  let measurementId = 1;
  
  for (let monthsAgo = 6; monthsAgo >= 0; monthsAgo--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - monthsAgo);
    const dateStr = formatDate(date);
    
    for (const cow of seedCows.filter(c => c.status !== 'Terjual')) {
      const measurementIdStr = `CM-${String(measurementId).padStart(4, '0')}`;
      
      const exists = await db.query.cowMeasurements.findFirst({
        where: (m, { and, eq }) => and(
          eq(m.cowId, cow.id!),
          eq(m.date, dateStr)
        ),
      });
      
      if (!exists) {
        // Weight changes over time
        const weightChange = monthsAgo * (cow.gender === 'Jantan' ? 8 : 5);
        const weight = (cow.weight! - weightChange);
        
        await db.insert(cowMeasurements).values({
          id: measurementIdStr,
          cowId: cow.id!,
          date: dateStr,
          weight: weight,
          length: cow.length!,
          chestCircumference: cow.chestCircumference!,
          notes: monthsAgo === 0 ? 'Latest measurement' : `Monthly check - ${monthsAgo} months ago`,
        });
        measurementsCreated++;
      }
      measurementId++;
    }
  }
  console.log(`   ✓ ${measurementsCreated} cow measurements created`);

  // ============================================
  // 5. ENVIRONMENTAL DATA (30 days history)
  // ============================================
  console.log('\n🌡️ Seeding Environmental Data...');
  let envCreated = 0;
  
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = getDaysAgo(daysAgo);
    
    const exists = await db.query.environmentalData.findFirst({
      where: (e, { eq }) => eq(e.date, date),
    });
    
    if (!exists) {
      // Simulate realistic weather patterns
      const baseTemp = 28 + Math.sin(daysAgo / 7) * 3;
      const tempMin = (baseTemp - 5).toFixed(1);
      const tempMax = (baseTemp + 6).toFixed(1);
      const humidity = Math.floor(65 + Math.sin(daysAgo / 14) * 20);
      
      // Calculate THI (Temperature Humidity Index)
      const thi = (0.8 * parseFloat(tempMax) + ((humidity / 100) * (parseFloat(tempMax) - 14.4)) + 46.4).toFixed(1);
      
      await db.insert(environmentalData).values({
        id: `ENV-${String(30 - daysAgo).padStart(3, '0')}`,
        date,
        tempMin,
        tempMax,
        humidity,
        thi,
        thunderstorm: daysAgo % 10 === 0, // Thunderstorm every 10 days
        notes: daysAgo % 10 === 0 ? 'Thunderstorm recorded' : '',
      });
      envCreated++;
    }
  }
  console.log(`   ✓ ${envCreated} environmental records created`);

  // ============================================
  // 6. MILK COLLECTION (buyer records)
  // ============================================
  console.log('\n📦 Seeding Milk Collection...');
  const buyers = ['Kansas Dairy', 'Green Fields', 'Fresh Milk Co', 'Organic Dairy Ltd'];
  let collectionCreated = 0;
  
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const date = getDaysAgo(daysAgo);
    
    // One collection per day
    const buyerName = buyers[daysAgo % buyers.length];
    
    // Calculate daily totals from milking records
    const dayRecords = Array.from({ length: 15 }, (_, i) => 10 + Math.random() * 8);
    const totalQuantity = dayRecords.reduce((a, b) => a + b, 0).toFixed(1);
    
    await db.insert(milkCollection).values({
      id: `MC-${String(14 - daysAgo).padStart(3, '0')}`,
      date,
      buyerName,
      totalQuantity,
      fatAverage: (3.7 + Math.random() * 0.4).toFixed(1),
      proteinAverage: (3.2 + Math.random() * 0.3).toFixed(1),
      notes: `Daily collection - ${buyerName}`,
    });
    collectionCreated++;
  }
  console.log(`   ✓ ${collectionCreated} milk collection records created`);

  // ============================================
  // 7. FARM EVENTS (all event types covered)
  // ============================================
  console.log('\n📅 Seeding Farm Events...');
  const eventTypes: Array<typeof farmEvents.$inferInsert & { type: string }> = [
    // Pemeriksaan Kesehatan (Health Check)
    { id: 'E-001', cowId: 'C-001', cowName: 'Garut 1', date: todayStr, type: 'Pemeriksaan Kesehatan', description: 'Routine health check - all vitals normal', vet: 'drh. Santoso', followUp: getDaysAgo(-30) },
    { id: 'E-002', cowId: 'C-005', cowName: 'Malang 2', date: getDaysAgo(3), type: 'Pemeriksaan Kesehatan', description: 'Post-calving checkup - recovering well', vet: 'drh. Santoso', followUp: getDaysAgo(-15) },
    
    // Pengawinan (Breeding/AI)
    { id: 'E-003', cowId: 'C-002', cowName: 'Garut 2', date: getDaysAgo(60), type: 'Pengawinan', description: 'Artificial insemination performed - sire: Champion genetics', vet: 'drh. Lestari', followUp: getDaysAgo(30) },
    { id: 'E-004', cowId: 'C-004', cowName: 'Malang 1', date: getDaysAgo(180), type: 'Pengawinan', description: 'Successful AI - confirmed pregnant', vet: 'drh. Lestari', followUp: '-' },
    { id: 'E-005', cowId: 'C-006', cowName: 'AB 1', date: getDaysAgo(45), type: 'Pengawinan', description: 'Heat detection positive - AI scheduled', vet: 'drh. Ahmad', followUp: getDaysAgo(-15) },
    
    // Penimbangan (Weighing)
    { id: 'E-006', cowId: 'C-008', cowName: 'Bumi', date: todayStr, type: 'Penimbangan', description: 'Monthly weight check - gained 15kg, excellent condition', vet: '-', followUp: '-' },
    { id: 'E-007', cowId: 'C-003', cowName: 'Garut 3', date: getDaysAgo(7), type: 'Penimbangan', description: 'Weight stable during dry period', vet: '-', followUp: '-' },
    
    // Vaksinasi (Vaccination)
    { id: 'E-008', cowId: 'C-001', cowName: 'Garut 1', date: getDaysAgo(14), type: 'Vaksinasi', description: 'FMD (Foot and Mouth Disease) booster vaccination', vet: 'drh. Santoso', followUp: getDaysAgo(-180) },
    { id: 'E-009', cowId: 'C-009', cowName: 'Putri', date: getDaysAgo(14), type: 'Vaksinasi', description: 'Hemorrhagic Septicemia (HS) vaccine', vet: 'drh. Santoso', followUp: getDaysAgo(-180) },
    { id: 'E-010', cowId: 'C-010', cowName: 'Isolasi', date: todayStr, type: 'Vaksinasi', description: 'Quarantine protocol - full vaccination suite', vet: 'drh. Ahmad', followUp: getDaysAgo(-30) },
    
    // Pengobatan (Treatment)
    { id: 'E-011', cowId: 'C-003', cowName: 'Garut 3', date: getDaysAgo(21), type: 'Pengobatan', description: 'Mastitis treatment - antibiotic therapy administered', vet: 'drh. Santoso', followUp: getDaysAgo(-7) },
    { id: 'E-012', cowId: 'C-007', cowName: 'AB 2', date: getDaysAgo(10), type: 'Pengobatan', description: 'Minor hoof injury - cleaned and bandaged', vet: 'drh. Ahmad', followUp: getDaysAgo(-3) },
    
    // Melahirkan (Calving)
    { id: 'E-013', cowId: 'C-005', cowName: 'Malang 2', date: getDaysAgo(45), type: 'Melahirkan', description: 'Successful calving - female calf, healthy birth weight 35kg', vet: 'drh. Lestari', followUp: getDaysAgo(-30) },
    { id: 'E-014', cowId: 'C-001', cowName: 'Garut 1', date: getDaysAgo(120), type: 'Melahirkan', description: 'Normal delivery - male calf, strong and healthy', vet: 'drh. Santoso', followUp: '-' },
    
    // Pemberian Cacing (Deworming)
    { id: 'E-015', cowId: 'C-002', cowName: 'Garut 2', date: getDaysAgo(30), type: 'Pemberian Cacing', description: 'Routine deworming - albendazole administered', vet: 'drh. Santoso', followUp: getDaysAgo(-90) },
    { id: 'E-016', cowId: 'C-008', cowName: 'Bumi', date: getDaysAgo(30), type: 'Pemberian Cacing', description: 'Quarterly deworming for breeding bull', vet: 'drh. Ahmad', followUp: getDaysAgo(-90) },
    
    // Pemotongan Kuku (Hoof Trimming)
    { id: 'E-017', cowId: 'C-008', cowName: 'Bumi', date: todayStr, type: 'Pemotongan Kuku', description: 'Regular hoof trimming - bull requires extra care', vet: 'drh. Ahmad', followUp: getDaysAgo(-90) },
    { id: 'E-018', cowId: 'C-004', cowName: 'Malang 1', date: getDaysAgo(60), type: 'Pemotongan Kuku', description: 'Preventive hoof trimming during pregnancy', vet: 'drh. Ahmad', followUp: getDaysAgo(-90) },
  ];

  let eventsCreated = 0;
  for (const event of eventTypes) {
    const exists = await db.query.farmEvents.findFirst({
      where: (e, { and, eq }) => and(
        eq(e.cowId, event.cowId!),
        eq(e.date, event.date),
        eq(e.type, event.type)
      ),
    });
    if (!exists) {
      await db.insert(farmEvents).values(event);
      eventsCreated++;
    }
  }
  console.log(`   ✓ ${eventsCreated} farm events created`);

  // ============================================
  // SUMMARY
  // ============================================
  await pool.end();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Database seeded successfully!');
  console.log('='.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   - ${usersCreated} users (admin, manager, workers, vet)`);
  console.log(`   - ${cowsCreated} cows (various statuses: Laktasi, Kering, Hamil, Aktif, Karantina, Terjual)`);
  console.log(`   - ${milkingRecordsCreated} milking records (14 days history)`);
  console.log(`   - ${measurementsCreated} cow measurements (6 months tracking)`);
  console.log(`   - ${envCreated} environmental records (30 days)`);
  console.log(`   - ${collectionCreated} milk collection records (14 days)`);
  console.log(`   - ${eventsCreated} farm events (all event types)`);
  
  console.log('\n🔐 Login credentials:');
  console.log('   Admin:   admin@farm.local   / admin123');
  console.log('   Manager: manager@farm.local / manager123');
  console.log('   Worker:  worker@farm.local  / worker123');
  console.log('   Vet:     vet@farm.local     / vet123');
  
  console.log('\n🚀 Ready to explore! Visit http://localhost:3000\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
