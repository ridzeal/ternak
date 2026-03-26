# Phase 5: Analytics & Insights

**Goal:** Add advanced analytics, monitoring, and insights for farm optimization.

**Timeline:** Week 6

---

## Task 5.1: Add THI Monitoring and Alerts

**Priority:** Medium  
**Complexity:** Medium  
**Files:** `src/lib/thi.ts`, `src/components/THIAlert.tsx`, `src/app/api/environment/alerts/`

### Background

**THI (Temperature Humidity Index)** indicates heat stress in cattle:
- THI < 72: No stress
- THI 72-79: Mild stress
- THI 80-89: Moderate stress
- THI ≥ 90: Severe stress

**Formula:** `THI = (0.8 × T) + ((RH/100) × (T - 14.4)) + 46.4`

### Features

1. **THI Calculator**:
   ```typescript
   // src/lib/thi.ts
   export function calculateTHI(temperature: number, humidity: number): number {
     return (0.8 * temperature) + ((humidity / 100) * (temperature - 14.4)) + 46.4;
   }
   
   export function getTHIStatus(thi: number): THIStatus {
     if (thi < 72) return { level: 'normal', color: '#22c55e' };
     if (thi < 80) return { level: 'mild', color: '#eab308' };
     if (thi < 90) return { level: 'moderate', color: '#f97316' };
     return { level: 'severe', color: '#ef4444' };
   }
   ```

2. **THI Dashboard Widget**:
   - Current THI reading
   - Status indicator with color
   - Recommendations based on level
   - 7-day THI trend chart

3. **THI Alerts**:
   - Push notification when THI exceeds threshold
   - Email alert for sustained high THI
   - Dashboard banner for active alerts

4. **THI History & Analysis**:
   - Historical THI chart
   - Correlation with milk production
   - Seasonal patterns
   - Heat stress impact report

### Acceptance Criteria
- [ ] THI auto-calculated from temp/humidity
- [ ] Status levels display correctly
- [ ] Alerts trigger at thresholds
- [ ] Historical THI tracked
- [ ] Recommendations shown per level
- [ ] THI trend chart renders

---

## Task 5.2: Add Production Trend Analysis

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/components/analytics/ProductionTrends.tsx`, `src/app/api/analytics/production/`

### Features

1. **Production Dashboard**:
   - Daily production trend (line chart)
   - Weekly/monthly comparison
   - Year-over-year comparison
   - Moving averages

2. **Per-Cow Analysis**:
   - Lactation curve per cow
   - Peak production identification
   - Production decline alerts
   - Lifetime production summary

3. **Herd Segmentation**:
   - Production by breed
   - Production by age group
   - Production by status
   - Top producers ranking

4. **Trend Insights**:
   - Automatic trend detection (increasing/decreasing)
   - Anomaly detection (unusual drops/spikes)
   - Seasonal pattern identification
   - Correlation with environmental factors

### Charts Required

1. **Daily Production Trend**:
   - Line chart with 30-day view
   - Toggle for weekly/monthly
   - Comparison with previous period

2. **Per-Cow Lactation Curve**:
   - Days in milk (DIM) vs production
   - Expected vs actual curve
   - Peak identification

3. **Production Distribution**:
   - Histogram of daily production
   - Quartile analysis
   - Outlier identification

### Acceptance Criteria
- [ ] Production trends display correctly
- [ ] Per-cow analysis available
- [ ] Comparisons work (week/month/year)
- [ ] Anomalies detected and flagged
- [ ] Charts interactive and responsive

---

## Task 5.3: Add Herd Performance Dashboard

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/components/analytics/HerdPerformance.tsx`

### Metrics to Track

1. **Herd Overview**:
   - Total herd size
   - Demographic breakdown (age, breed, status)
   - Entry/exit rates
   - Average age

2. **Reproductive Performance**:
   - Conception rate
   - Calving interval
   - Days open
   - Age at first calving
   - Services per conception

3. **Production Performance**:
   - Average daily production
   - Production per lactating cow
   - Peak production percentage
   - Persistency rate

4. **Health Metrics**:
   - Disease incidence rate
   - Treatment frequency
   - Recovery rate
   - Common conditions

5. **Growth Metrics** (for young stock):
   - Average daily gain
   - Weight milestones
   - Growth curve tracking

### Visualizations

1. **Herd Pyramid**:
   - Age distribution pyramid
   - Status breakdown pie chart

2. **KPI Cards**:
   - Key metrics with trend indicators
   - Color-coded performance

3. **Performance Scorecard**:
   - Benchmark comparison
   - Target vs actual
   - Improvement areas highlighted

### Acceptance Criteria
- [ ] All herd metrics calculated
- [ ] Reproductive tracking accurate
- [ ] Production KPIs displayed
- [ ] Health metrics tracked
- [ ] Dashboard loads quickly
- [ ] Data exportable

---

## Task 5.4: Add Reproductive Status Tracking

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/components/ReproductiveTracking.tsx`

### Database Schema

```typescript
export const reproductiveEvents = pgTable('reproductive_events', {
  id: text('id').primaryKey(),
  cowId: text('cow_id').notNull(),
  cowName: text('cow_name').notNull(),
  
  // Event type
  eventType: text('event_type', {
    enum: ['Heat', 'Insemination', 'Pregnancy Check', 'Pregnant', 'Miscarriage', 'Calving', 'Edema']
  }).notNull(),
  
  // Event details
  eventDate: text('event_date').notNull(),
  expectedDate: text('expected_date'),  // For due dates
  actualDate: text('actual_date'),      // For actual calving
  
  // Insemination details
  semenId: text('semen_id'),            // Bull/sire identifier
  semenSource: text('semen_source'),
  technician: text('technician'),
  
  // Pregnancy details
  pregnancyStatus: text('pregnancy_status', {
    enum: ['Open', 'Pregnant', 'Uncertain']
  }),
  pregnancyDays: integer('pregnancy_days'),
  
  // Calving details
  calfGender: text('calf_gender', {
    enum: ['Male', 'Female', 'Twins']
  }),
  calfWeight: decimal('calf_weight'),
  calvingEase: text('calving_ease', {
    enum: ['Easy', 'Assisted', 'Difficult']
  }),
  
  // Status tracking
  status: text('status').default('Active'), // dara, hamil, keguguran, edema, melahirkan
  notes: text('notes'),
  
  createdAt: text('created_at').notNull(),
});
```

### Features

1. **Reproductive Calendar**:
   - Heat cycles visualization
   - Breeding schedule
   - Due date countdown
   - Calving schedule

2. **Status Tracking**:
   - Dara (maiden/heifer)
   - Hamil (pregnant) with trimester
   - Keguguran (miscarriage) tracking
   - Edema monitoring
   - Melahirkan (calving) record

3. **Reproductive Alerts**:
   - Heat detection reminders
   - Pregnancy check due
   - Dry-off date (60 days before calving)
   - Calving soon alert (7 days before)

4. **Reproductive Reports**:
   - Conception rate by bull
   - Calving interval analysis
   - Age at first calving
   - Reproductive efficiency

### Acceptance Criteria
- [ ] Reproductive events tracked
- [ ] Status updates automatically
- [ ] Calendar shows all events
- [ ] Alerts trigger appropriately
- [ ] Reports generate correctly
- [ ] Matches Excel "Keterangan" tracking

---

## Task 5.5: Create Executive Dashboard

**Priority:** Medium  
**Complexity:** High  
**Files:** `src/components/Dashboard.tsx`, `src/app/dashboard/`

### Dashboard Sections

1. **Today's Overview** (Top Row):
   - Date and environmental conditions
   - THI alert if applicable
   - Quick stats (total cows, lactating, production today)

2. **Action Required** (Left Column):
   - Follow-ups due today
   - Cows to breed
   - Cows to dry off
   - Calving soon
   - Health checks needed

3. **Production Summary** (Center):
   - Today's production vs target
   - 7-day trend
   - Top producers today
   - Collection summary

4. **Herd Health** (Right Column):
   - Cows in treatment
   - Recent health events
   - Vaccination schedule
   - Body condition scores

5. **Inventory Alerts** (Bottom):
   - Feed low stock
   - Supplies needed
   - Equipment maintenance due

### Features

1. **Customizable Widgets**:
   - Drag and drop layout
   - Show/hide widgets
   - Resize widgets
   - Save preferences

2. **Time Period Selector**:
   - Today
   - This week
   - This month
   - Custom range

3. **Quick Actions Panel**:
   - Add milking record
   - Add event
   - Record breeding
   - View reports

4. **Notifications Center**:
   - All alerts in one place
   - Mark as read
   - Snooze reminders
   - Notification settings

### Acceptance Criteria
- [ ] Dashboard loads in < 2 seconds
- [ ] All widgets display correctly
- [ ] Alerts update in real-time
- [ ] Quick actions work
- [ ] Layout customizable and saved
- [ ] Mobile responsive

---

## Task 5.6: Add Data Export API

**Priority:** Low  
**Complexity:** Medium  
**Files:** `src/app/api/export/all/`, `src/lib/backup.ts`

### Features

1. **Full Database Export**:
   - Export all tables to JSON
   - Export all tables to CSV
   - Include metadata (export date, version)

2. **Scheduled Backups**:
   - Daily automatic export
   - Store in cloud (S3, Google Drive)
   - Email backup file

3. **Data Portability**:
   - Import from backup file
   - Migrate to new instance
   - Data archive

### Acceptance Criteria
- [ ] Full export works
- [ ] All data included
- [ ] Import from backup works
- [ ] Scheduled backups configured

---

## Definition of Done (Phase 5)

- [ ] All 6 tasks completed
- [ ] THI monitoring functional with alerts
- [ ] Production trends analyzed
- [ ] Herd performance dashboard complete
- [ ] Reproductive tracking matches Excel
- [ ] Executive dashboard operational
- [ ] Data export API working
- [ ] All analytics accurate
- [ ] Code reviewed and merged

---

## Testing Checklist

- [ ] THI calculates correctly for all inputs
- [ ] THI alerts trigger at correct thresholds
- [ ] Production trends show accurate data
- [ ] Per-cow lactation curves render
- [ ] Herd metrics calculated correctly
- [ ] Reproductive events tracked properly
- [ ] Calendar displays all events
- [ ] Alerts fire at appropriate times
- [ ] Dashboard loads quickly
- [ ] All charts responsive
- [ ] Data export includes all records
- [ ] Import from backup restores correctly

---

*Phase 5 of 5 - Analytics & Insights*

---

## Project Completion Checklist

### All Phases Complete When:

- [ ] Phase 1: Core Dairy Operations ✓
- [ ] Phase 2: Inventory & Assets ✓
- [ ] Phase 3: Land & Pasture Management ✓
- [ ] Phase 4: Reporting & Export ✓
- [ ] Phase 5: Analytics & Insights ✓

### Final Validation:

- [ ] All 5 Excel sheets replicated in app
- [ ] Daily data entry ≤ Excel time
- [ ] All reports exportable to Excel
- [ ] Migration from Excel successful
- [ ] User trained and comfortable
- [ ] Documentation complete
- [ ] Production deployment ready

---

*End of Phase 5 - Project Complete*
