import { pgTable, text, integer, decimal, date, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', {
    enum: ['admin', 'manager', 'worker']
  }).default('worker').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const cows = pgTable('cows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  breed: text('breed').notNull(),
  dob: text('dob').notNull(),
  gender: text('gender', { enum: ['Betina', 'Jantan'] }).notNull(),
  weight: integer('weight').notNull(),
  status: text('status', {
    enum: ['Laktasi', 'Kering', 'Hamil', 'Aktif', 'Karantina', 'Terjual']
  }).notNull(),
  tag: text('tag').notNull(),
  sire: text('sire'),
  dam: text('dam'),
  length: integer('length'), // Body length in cm (Panjang)
  chestCircumference: integer('chest_circumference'), // Chest circumference in cm (Lingkar dada)
  reproductiveNotes: text('reproductive_notes'), // Reproductive status notes (Keterangan)
});

export const milkingRecords = pgTable('milking_records', {
  id: text('id').primaryKey(),
  cowId: text('cow_id').notNull(),
  cowName: text('cow_name').notNull(),
  date: text('date').notNull(),
  session: text('session', { enum: ['Pagi', 'Siang', 'Malam'] }).notNull(),
  volume: decimal('volume').notNull(),
  fat: decimal('fat').notNull(),
  protein: decimal('protein').notNull(),
  lactose: decimal('lactose'),
  totalSolids: decimal('total_solids'),
  notes: text('notes'),
});

export const cowMeasurements = pgTable('cow_measurements', {
  id: text('id').primaryKey(),
  cowId: text('cow_id').notNull(),
  date: text('date').notNull(),
  weight: integer('weight').notNull(),
  length: integer('length'),
  chestCircumference: integer('chest_circumference'),
  notes: text('notes'),
});

export const environmentalData = pgTable('environmental_data', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(),
  tempMin: decimal('temp_min'),
  tempMax: decimal('temp_max'),
  humidity: integer('humidity'),
  thi: decimal('thi'), // Temperature Humidity Index (auto-calculated)
  thunderstorm: boolean('thunderstorm').default(false),
  notes: text('notes'),
});

export const milkCollection = pgTable('milk_collection', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  buyerName: text('buyer_name').notNull(), // e.g., "Kansas"
  totalQuantity: decimal('total_quantity').notNull(),
  fatAverage: decimal('fat_average'),
  proteinAverage: decimal('protein_average'),
  notes: text('notes'),
});

export const farmEvents = pgTable('farm_events', {
  id: text('id').primaryKey(),
  cowId: text('cow_id').notNull(),
  cowName: text('cow_name').notNull(),
  date: text('date').notNull(),
  type: text('type', { 
    enum: ['Pemeriksaan Kesehatan', 'Pengawinan', 'Penimbangan', 'Vaksinasi', 'Pengobatan', 'Melahirkan', 'Pemberian Cacing', 'Pemotongan Kuku'] 
  }).notNull(),
  description: text('description').notNull(),
  vet: text('vet').notNull(),
  followUp: text('follow_up').notNull(),
});
