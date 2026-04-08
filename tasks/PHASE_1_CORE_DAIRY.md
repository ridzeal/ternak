# Phase 1: Core Dairy Operations Enhancement

**Goal:** Enhance existing modules to match user's current Excel-based workflow for daily dairy operations.

**Timeline:** Week 1-2

---

## Task 1.1: Enhance Cow Model with Body Measurements

**Priority:** High  
**Complexity:** Low  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/components/forms/AddCowForm.tsx`

### Changes Required

1. **Update database schema** (`src/db/schema.ts`):
   - Add `length` field (cm) - for "Panjang"
   - Add `chestCircumference` field (cm) - for "Lingkar dada"
   - Add `reproductiveNotes` field (text) - for "Keterangan" status

2. **Update TypeScript types** (`src/types/index.ts`):
   - Add new fields to `Cow` interface
   - Update form types accordingly

3. **Update cow form** (`src/components/forms/AddCowForm.tsx`):
   - Add input fields for body length
   - Add input fields for chest circumference
   - Add text area for reproductive notes

4. **Update API endpoint** (`src/app/api/cows/route.ts`):
   - Handle new fields in POST/PUT requests

### Acceptance Criteria
- [x] Can record cow body measurements (length, chest circumference)
- [x] Can record reproductive status notes
- [x] Existing cow data remains compatible
- [x] Form validation includes new fields

---

## Task 1.2: Add Historical Weight & Measurement Tracking

**Priority:** Medium  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/app/api/cow-measurements/`

### Changes Required

1. **Create new table** (`src/db/schema.ts`):
   ```typescript
   export const cowMeasurements = pgTable('cow_measurements', {
     id: text('id').primaryKey(),
     cowId: text('cow_id').notNull(),
     date: text('date').notNull(),
     weight: integer('weight').notNull(),
     length: integer('length'),
     chestCircumference: integer('chest_circumference'),
     notes: text('notes'),
   });
   ```

2. **Create API endpoints**:
   - `GET /api/cow-measurements?cowId=xxx` - Get measurements for cow
   - `POST /api/cow-measurements` - Add new measurement
   - `DELETE /api/cow-measurements?id=xxx` - Remove measurement

3. **Create UI component**:
   - Measurement history view in cow detail
   - Weight trend chart (optional)

### Acceptance Criteria
- [x] Can track weight changes over time
- [x] Can view measurement history per cow
- [x] Measurements linked to milking dates (for correlation)

---

## Task 1.3: Enhance Milking Model for 3 Daily Sessions

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/components/forms/AddMilkingForm.tsx`

### Current Issue
The Excel tracks **3 milkings per cow per day** in a single row. Current app creates 1 record per session.

### Option A: Keep Current Structure (Recommended)
Keep 1 record per session but improve the UI for batch entry.

### Option B: Daily Milking Group
Create a parent "daily milking" record with 3 session children.

### Changes Required (Option A)

1. **Update milking form** to support batch entry:
   - Single form showing all lactating cows
   - 3 volume columns (Perahan 1, 2, 3)
   - Submit all at once

2. **Create daily milking view**:
   - Group by date
   - Show totals per cow
   - Match Excel "AB Susu Harian" format

3. **Add session total calculation**:
   - Auto-calculate total per cow per day
   - Display in daily summary

### Acceptance Criteria
- [x] Can enter 3 sessions for multiple cows in single view
- [x] Daily totals auto-calculated
- [x] View matches Excel "AB Susu Harian" layout

---

## Task 1.4: Add Environmental Data Tracking

**Priority:** Medium  
**Complexity:** Low  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/app/api/environment/`

### Changes Required

1. **Create new table** (`src/db/schema.ts`):
   ```typescript
   export const environmentalData = pgTable('environmental_data', {
     id: text('id').primaryKey(),
     date: text('date').notNull(),
     tempMin: decimal('temp_min'),
     tempMax: decimal('temp_max'),
     humidity: integer('humidity'),
     thi: decimal('thi'), // Temperature Humidity Index (auto-calculated)
     thunderstorm: boolean('thunderstorm').default(false),
     notes: text('notes'),
   });
   ```

2. **Create API endpoints**:
   - `GET /api/environment?date=xxx`
   - `POST /api/environment`
   - `PUT /api/environment`

3. **Create daily environmental entry form**:
   - Input: Temp min, Temp max, Humidity
   - Auto-calculate THI using formula: `THI = (0.8 × T) + ((RH/100) × (T - 14.4)) + 46.4`
   - Thunderstorm checkbox

4. **Integrate with daily milk entry**:
   - Show environmental header on daily milk report
   - Link environmental data to milking records

### Acceptance Criteria
- [x] Can record daily environmental data
- [x] THI auto-calculated from temperature and humidity
- [x] Environmental data appears on daily milk report
- [x] Thunderstorm indicator tracked

---

## Task 1.5: Add Milk Quality Metrics

**Priority:** High  
**Complexity:** Low  
**Files:** `src/db/schema.ts`, `src/types/index.ts`

### Changes Required

1. **Update milking_records schema**:
   - Add `lactose` field (decimal)
   - Add `totalSolids` field (decimal)
   - Update fat/protein ranges validation

2. **Update milking form**:
   - Add lactose input (%)
   - Add total solids input (%)
   - Show quality ranges (Fat: 3.8-4.2%, Lactose: min 4.5%, etc.)

3. **Add quality alerts**:
   - Flag readings outside normal ranges
   - Visual indicators for quality issues

### Acceptance Criteria
- [x] Can record lactose percentage
- [x] Can record total solids percentage
- [x] Quality alerts for out-of-range values (warning + error levels)
- [x] Visual indicators (border color + status text) for each quality metric
- [x] Summary alert box showing all out-of-range metrics

---

## Task 1.6: Add Milk Collection/Buyer Tracking

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/app/api/milk-collection/`

### Changes Required

1. **Create new table** (`src/db/schema.ts`):
   ```typescript
   export const milkCollection = pgTable('milk_collection', {
     id: text('id').primaryKey(),
     date: text('date').notNull(),
     buyerName: text('buyer_name').notNull(), // e.g., "Kansas"
     totalQuantity: decimal('total_quantity').notNull(),
     fatAverage: decimal('fat_average'),
     proteinAverage: decimal('protein_average'),
     notes: text('notes'),
   });
   ```

2. **Create API endpoints**:
   - `GET /api/milk-collection`
   - `POST /api/milk-collection`
   - `PUT /api/milk-collection`

3. **Create collection entry form**:
   - Date selector
   - Buyer name input
   - Total quantity received
   - Average quality metrics
   - Notes field

4. **Link to daily production**:
   - Compare daily production vs collected amount
   - Track usage/waste

### Acceptance Criteria
- [x] Can record milk collection by buyer
- [x] Collection quantity tracked
- [x] UI form with validation (date, buyer name, quantity)
- [x] Edit and delete functionality
- [x] Penjualan tab with records table

---

## Task 1.7: Create Daily Milk Entry Form (Batch Entry)

**Priority:** High  
**Complexity:** High  
**Files:** `src/components/forms/DailyMilkingForm.tsx`, `src/app/page.tsx`

### Changes Required

1. **Create new component** `DailyMilkingForm.tsx`:
   - Table layout matching Excel "AB Susu Harian"
   - Rows: All lactating cows
   - Columns: No, Nama, Perahan 1, Perahan 2, Perahan 3, Total, Keterangan
   - Environmental header section
   - Date selector

2. **Features**:
   - Auto-calculate row totals (Perahan 1+2+3)
   - Copy from previous day button
   - Save all records at once
   - Individual cow notes field

3. **Integration**:
   - Replace or supplement current single milking entry
   - Link to environmental data entry
   - Generate daily summary

### Acceptance Criteria
- [x] Form layout matches Excel "AB Susu Harian"
- [x] Can enter data for all cows in one session
- [x] Totals auto-calculated
- [x] Environmental data included
- [x] Data saves to existing milking_records table

---

## Task 1.8: Create Daily Milk Report View

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/components/reports/DailyMilkReport.tsx`

### Changes Required

1. **Create report component**:
   - Header with date, environmental data
   - Table with all cows and 3 session columns
   - Totals row
   - Summary statistics

2. **Features**:
   - Date range selector
   - Export to Excel (matching original format)
   - Print-friendly layout

3. **Data aggregation**:
   - Daily totals per cow
   - Average per cow per day
   - Environmental summary

### Acceptance Criteria
- [x] Report matches Excel "AB Susu Harian" format
- [x] Environmental data displayed in header
- [x] All cows listed with 3 session columns
- [x] Totals and averages calculated
- [x] Export to Excel functionality (CSV export)

---

## Definition of Done (Phase 1)

- [x] All 8 tasks completed
- [x] Database migrations created and tested
- [x] API endpoints tested
- [x] UI components responsive and functional
- [x] Data entry workflow tested with sample data
- [x] Export matches Excel format (CSV)
- [x] Quality alerts implemented with warning/error levels
- [x] Milk collection UI with validation and CRUD operations
- [x] E2E tests added for new features

---

## Testing Checklist

- [x] Can add cow with body measurements
- [x] Can enter 3 milk sessions for multiple cows
- [x] Environmental THI auto-calculates correctly
- [x] Milk quality metrics save correctly
- [x] Milk quality alerts show for out-of-range values
- [x] Milk collection records save correctly via UI
- [x] Daily report generates correctly
- [x] CSV export matches original format
- [x] All calculations accurate (totals, averages)

---

*Phase 1 of 5 - Core Dairy Operations*
