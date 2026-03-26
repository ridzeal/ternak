import { db } from '../src/db';
import { users, cows, milkingRecords, farmEvents } from '../src/db/schema';
import { hashPassword } from '../src/lib/auth';

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create admin user
    const adminEmail = 'admin@farm.local';
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, adminEmail),
    });

    if (!existingAdmin) {
      await db.insert(users).values({
        id: `user_admin_${Date.now()}`,
        email: adminEmail,
        passwordHash: hashPassword('admin123'),
        name: 'Farm Admin',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Created admin user (admin@farm.local / admin123)');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create demo cows
    const demoCows = [
      { id: 'C-001', name: 'Garut 1', breed: 'Friesian Holstein', dob: '2020-03-12', gender: 'Betina', weight: 480, status: 'Laktasi', tag: 'FH-4821', length: 150, chestCircumference: 201, reproductiveNotes: 'M4, M5 dara' },
      { id: 'C-002', name: 'Garut 2', breed: 'Friesian Holstein', dob: '2019-07-04', gender: 'Betina', weight: 510, status: 'Laktasi', tag: 'FH-4822', length: 160, chestCircumference: 194, reproductiveNotes: 'AB1, AB3 hamil' },
      { id: 'C-003', name: 'Garut 3', breed: 'Limousin', dob: '2021-01-20', gender: 'Betina', weight: 520, status: 'Kering', tag: 'LM-2219', length: 150, chestCircumference: 200, reproductiveNotes: 'AB5 keguguran' },
      { id: 'C-004', name: 'Malang 1', breed: 'Simmental', dob: '2020-06-15', gender: 'Betina', weight: 550, status: 'Hamil', tag: 'SM-3301', length: 155, chestCircumference: 205, reproductiveNotes: 'AB6 Edema' },
      { id: 'C-005', name: 'Malang 2', breed: 'Friesian Holstein', dob: '2019-11-08', gender: 'Betina', weight: 490, status: 'Laktasi', tag: 'FH-4823', length: 148, chestCircumference: 198, reproductiveNotes: 'Garut D melahirkan' },
      { id: 'C-006', name: 'AB 1', breed: 'Friesian Holstein', dob: '2021-02-10', gender: 'Betina', weight: 475, status: 'Laktasi', tag: 'FH-4824', length: 152, chestCircumference: 203, reproductiveNotes: '' },
      { id: 'C-007', name: 'AB 2', breed: 'Limousin', dob: '2020-08-22', gender: 'Betina', weight: 530, status: 'Kering', tag: 'LM-2220', length: 158, chestCircumference: 196, reproductiveNotes: '' },
      { id: 'C-008', name: 'Bumi', breed: 'Simmental', dob: '2019-04-05', gender: 'Jantan', weight: 620, status: 'Aktif', tag: 'SM-3302', length: 165, chestCircumference: 215, reproductiveNotes: 'Sire bull' },
    ];

    let cowsCreated = 0;
    for (const cow of demoCows) {
      const exists = await db.query.cows.findFirst({
        where: (cows, { eq }) => eq(cows.tag, cow.tag),
      });
      if (!exists) {
        await db.insert(cows).values(cow);
        cowsCreated++;
      }
    }
    console.log(`✓ ${cowsCreated} demo cows created (${demoCows.length - cowsCreated} already exist)`);

    // Create demo milking records (today's session)
    const today = new Date().toISOString().split('T')[0];
    const demoMilkings = [
      { id: `M-001`, cowId: 'C-001', cowName: 'Garut 1', date: today, session: 'Pagi', volume: 12.5, fat: 3.8, protein: 3.2, notes: '' },
      { id: `M-002`, cowId: 'C-001', cowName: 'Garut 1', date: today, session: 'Siang', volume: 10.2, fat: 3.9, protein: 3.1, notes: '' },
      { id: `M-003`, cowId: 'C-002', cowName: 'Garut 2', date: today, session: 'Pagi', volume: 14.1, fat: 4.1, protein: 3.4, notes: '' },
      { id: `M-004`, cowId: 'C-005', cowName: 'Malang 2', date: today, session: 'Pagi', volume: 11.8, fat: 3.7, protein: 3.0, notes: '' },
      { id: `M-005`, cowId: 'C-006', cowName: 'AB 1', date: today, session: 'Pagi', volume: 13.2, fat: 4.0, protein: 3.3, notes: '' },
    ];

    let milkingsCreated = 0;
    for (const milking of demoMilkings) {
      const exists = await db.query.milkingRecords.findFirst({
        where: (milkingRecords, { and, eq }) => 
          and(
            eq(milkingRecords.cowId, milking.cowId),
            eq(milkingRecords.date, milking.date),
            eq(milkingRecords.session, milking.session)
          ),
      });
      if (!exists) {
        await db.insert(milkingRecords).values(milking);
        milkingsCreated++;
      }
    }
    console.log(`✓ ${milkingsCreated} milking records created`);

    // Create demo events
    const demoEvents = [
      { id: `E-001`, cowId: 'C-001', cowName: 'Garut 1', date: today, type: 'Pemeriksaan Kesehatan', description: 'Routine vaccination - FMD booster', vet: 'drh. Santoso', followUp: '2026-04-25' },
      { id: `E-002`, cowId: 'C-002', cowName: 'Garut 2', date: today, type: 'Pengawinan', description: 'Artificial insemination performed', vet: 'drh. Lestari', followUp: '2026-04-25' },
      { id: `E-003`, cowId: 'C-004', cowName: 'Malang 1', date: today, type: 'Penimbangan', description: 'Monthly weight check - gained 15kg', vet: '-', followUp: '-' },
      { id: `E-004`, cowId: 'C-008', cowName: 'Bumi', date: today, type: 'Pemotongan Kuku', description: 'Regular hoof trimming', vet: 'drh. Ahmad', followUp: '-' },
    ];

    let eventsCreated = 0;
    for (const event of demoEvents) {
      const exists = await db.query.farmEvents.findFirst({
        where: (farmEvents, { and, eq }) => 
          and(
            eq(farmEvents.cowId, event.cowId),
            eq(farmEvents.date, event.date),
            eq(farmEvents.type, event.type)
          ),
      });
      if (!exists) {
        await db.insert(farmEvents).values(event);
        eventsCreated++;
      }
    }
    console.log(`✓ ${eventsCreated} farm events created`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - 1 admin user`);
    console.log(`   - ${demoCows.length} cows`);
    console.log(`   - ${demoMilkings.length} milking records (today)`);
    console.log(`   - ${demoEvents.length} farm events (today)`);
    console.log('\n🚀 Ready to demo! Login at http://localhost:3000/login');
    console.log('   Email: admin@farm.local');
    console.log('   Password: admin123\n');

  } catch (error: any) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seed();
