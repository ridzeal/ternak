# Phase 3: Land & Pasture Management

**Goal:** Build land management module for pasture/forage tracking.

**Timeline:** Week 4

---

## Task 3.1: Create Land Plot Management

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/app/api/land/`, `src/components/LandManagement.tsx`

### Database Schema

```typescript
export const landPlots = pgTable('land_plots', {
  id: text('id').primaryKey(),
  plotName: text('plot_name').notNull(),    // Plot identifier (A, B, etc.)
  location: text('location'),                // Location description
  area: decimal('area'),                     // Area in hectares/m²
  areaUnit: text('area_unit'),               // "ha", "m²", "acre"
  
  // Crop information
  cropType: text('crop_type', {
    enum: ['Pakchong', 'Red Napier', 'Telang', 'Millet', 'Mombassa', 'Other']
  }),
  cropVariety: text('crop_variety'),         // Full variety name
  plantingDate: text('planting_date'),
  
  // Cut cycle tracking
  currentCutCycle: integer('cut_cycle'),     // Current cycle number
  lastCutDate: text('last_cut_date'),
  nextCutDate: text('next_cut_date'),
  
  // Status
  status: text('status', {
    enum: ['Growing', 'Ready', 'Harvested', 'Fallow', 'Other']
  }).default('Growing'),
  
  // Assignment
  assignedTo: text('assigned_to'),           // Animal group (e.g., "Anak")
  barnLocation: text('barn_location'),       // Barn/Kandan location
  
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
```

### API Endpoints

- `GET /api/land` - List all plots
- `POST /api/land` - Add new plot
- `PUT /api/land` - Update plot
- `DELETE /api/land?id=xxx` - Delete plot
- `GET /api/land/ready-to-harvest` - Get plots ready for harvest
- `PUT /api/land/harvest?id=xxx` - Mark plot as harvested

### UI Components

1. **Land Plot List View**:
   - Table matching Excel "Lahan" structure
   - Columns: No, Plot Name, Crop Type, Cut Cycle, Location, Status, Assigned To
   - Visual status indicators (Growing, Ready, Harvested)
   - Filter by crop type, status

2. **Add/Edit Plot Modal**:
   - Form with all fields
   - Crop type selector with descriptions
   - Cut cycle auto-increment suggestion
   - Date pickers

3. **Plot Detail View**:
   - Full plot information
   - Harvest history
   - Photos (optional future feature)

### Acceptance Criteria
- [ ] Can add, edit, delete land plots
- [ ] Crop types match Excel (Pakchong, Red Napier, Telang, Millet, Mombassa)
- [ ] Cut cycle tracking works
- [ ] Status updates correctly
- [ ] Assignment to animal groups works

---

## Task 3.2: Create Forage Harvest Tracking

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/app/api/forage-harvests/`

### Database Schema

```typescript
export const forageHarvests = pgTable('forage_harvests', {
  id: text('id').primaryKey(),
  plotId: text('plot_id').notNull(),
  plotName: text('plot_name').notNull(),
  
  // Harvest details
  harvestDate: text('harvest_date').notNull(),
  cutNumber: integer('cut_number').notNull(),  // 1st Cut, 2nd Cut, 3rd Cut
  quantity: decimal('quantity'),               // Harvested amount
  quantityUnit: text('quantity_unit'),         // "kg", "ton", "bundle"
  
  // Quality
  quality: text('quality', {
    enum: ['Excellent', 'Good', 'Average', 'Poor']
  }),
  height: decimal('height'),                   // Grass height at harvest
  heightUnit: text('height_unit'),             // "cm"
  
  // Usage
  usedFor: text('used_for'),                   // Which animals
  storageLocation: text('storage_location'),
  
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});
```

### API Endpoints

- `GET /api/forage-harvests` - List all harvests
- `POST /api/forage-harvests` - Add harvest record
- `PUT /api/forage-harvests` - Update harvest record
- `DELETE /api/forage-harvests?id=xxx` - Delete harvest record
- `GET /api/forage-harvests?plotId=xxx` - Get harvests for specific plot

### UI Components

1. **Harvest Record Form**:
   - Plot selector
   - Cut number (auto-suggest next cycle)
   - Quantity input
   - Quality rating
   - Notes field

2. **Harvest History View**:
   - List of all harvests
   - Filter by plot, date range, cut number
   - Total yield statistics

3. **Cut Cycle Visualization**:
   - Timeline showing cut cycles per plot
   - Days between cuts
   - Yield per cut comparison

### Acceptance Criteria
- [ ] Can record harvest with cut number
- [ ] Matches Excel cut cycle tracking (1st, 2nd, 3rd Cut)
- [ ] Harvest history maintained
- [ ] Yield tracking works
- [ ] Plot status updates after harvest

---

## Task 3.3: Create Harvest Scheduling

**Priority:** Medium  
**Complexity:** Low  
**Files:** `src/components/HarvestSchedule.tsx`

### Features

1. **Harvest Calendar**:
   - Visual calendar showing scheduled harvests
   - Color-coded by plot
   - Cut cycle indicators

2. **Harvest Reminders**:
   - Alert when plots approaching harvest readiness
   - Based on typical cut cycles (e.g., Pakchong every 45 days)
   - Dashboard notifications

3. **Schedule Planning**:
   - Plan future harvests
   - Assign to workers
   - Track completion

### Acceptance Criteria
- [ ] Calendar view shows harvest schedule
- [ ] Reminders for upcoming harvests
- [ ] Can plan future harvest dates
- [ ] Cut cycle timing tracked

---

## Task 3.4: Create Crop Type Management

**Priority:** Low  
**Complexity:** Low  
**Files:** `src/db/schema.ts`, `src/components/CropTypes.tsx`

### Database Schema

```typescript
export const cropTypes = pgTable('crop_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),            // "Pakchong", "Red Napier", etc.
  scientificName: text('scientific_name'), // Botanical name
  description: text('description'),
  
  // Growing characteristics
  maturityDays: integer('maturity_days'),  // Days to first harvest
  cutCycleDays: integer('cut_cycle_days'), // Days between cuts
  expectedYield: decimal('expected_yield'), // Expected yield per harvest
  yieldUnit: text('yield_unit'),
  
  // Requirements
  waterRequirement: text('water_requirement'),
  fertilizerRequirement: text('fertilizer_requirement'),
  
  // Best practices
  plantingDistance: text('planting_distance'), // e.g., "65 cm x 65 cm"
  bestSeason: text('best_season'),
  
  isActive: boolean('is_active').default(true),
});
```

### UI Components

1. **Crop Type Library**:
   - List of all crop types
   - Growing information
   - Best practices

2. **Add/Edit Crop Type**:
   - Form for custom crop types
   - Pre-populated templates for common types

### Acceptance Criteria
- [ ] Crop type library available
- [ ] Growing information documented
- [ ] Can add custom crop types
- [ ] Crop info auto-fills in plot form

---

## Task 3.5: Create Land Management Dashboard

**Priority:** Medium  
**Complexity:** Low  
**Files:** `src/components/LandDashboard.tsx`

### Components

1. **Summary Cards**:
   - Total plots count
   - Plots ready to harvest
   - Harvests this month
   - Average yield per cut

2. **Charts**:
   - Plots by crop type (pie chart)
   - Plots by status (bar chart)
   - Harvest yield trends (line chart)
   - Cut cycle comparison

3. **Quick Actions**:
   - Add new plot
   - Record harvest
   - View schedule
   - See ready plots

4. **Alerts**:
   - Plots ready for harvest
   - Overdue harvests
   - Low yield warnings

### Acceptance Criteria
- [ ] Dashboard shows all key land metrics
- [ ] Harvest alerts visible
- [ ] Charts render correctly
- [ ] Quick actions accessible

---

## Definition of Done (Phase 3)

- [ ] All 5 tasks completed
- [ ] Land plot management fully functional
- [ ] Harvest tracking works correctly
- [ ] Cut cycle tracking matches Excel
- [ ] Crop types documented
- [ ] Dashboard displays all metrics
- [ ] Harvest scheduling works
- [ ] Code reviewed and merged

---

## Testing Checklist

- [ ] Can add land plot with all details
- [ ] Crop types match Excel options
- [ ] Cut cycle increments correctly
- [ ] Recording harvest updates plot status
- [ ] Harvest history maintained
- [ ] Harvest calendar displays correctly
- [ ] Reminders appear for ready plots
- [ ] Dashboard shows correct statistics
- [ ] Yield tracking accurate

---

*Phase 3 of 5 - Land & Pasture Management*
