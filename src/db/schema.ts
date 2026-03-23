import { pgTable, text, integer, decimal, date } from 'drizzle-orm/pg-core';

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
