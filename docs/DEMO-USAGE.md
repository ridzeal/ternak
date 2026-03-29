# Demo Usage Guide

This guide helps you explore all features of **Ternak** - Cattle Farm Manager using the pre-seeded demo data.

---

## 🚀 Quick Start

### 1. Start the Development Server

```bash
just dev
```

Visit: **http://localhost:7500**

### 2. Login with Demo Accounts

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| **Admin** | `admin@farm.local` | `admin123` | Full access - explore all features |
| **Manager** | `manager@farm.local` | `manager123` | Day-to-day farm operations |
| **Worker** | `worker@farm.local` | `worker123` | Daily tasks (milking, feeding) |
| **Vet** | `vet@farm.local` | `vet123` | Health records & events |

---

## 📋 Feature Walkthrough

### 1. 🐄 Cow Management

**What to explore:**

- View all 11 cows with different statuses
- See cow details: breed, weight, age, reproductive history
- Track individual cow metrics over time

**Demo Data Highlights:**

- **5 Lactating cows** (Garut 1, Garut 2, Malang 2, AB 1, Putri) - actively producing milk
- **2 Dry cows** (Garut 3, AB 2) - resting between lactations
- **1 Pregnant cow** (Malang 1) - 6 months pregnant
- **1 Breeding bull** (Bumi) - active sire
- **1 Quarantine cow** (Isolasi) - new arrival under observation
- **1 Sold cow** (Mantap) - historical record

**Try this:**

1. Navigate to **Cows** → **List**
2. Click on **Garut 1** to see full profile
3. View **Measurements** tab to see 6-month weight trend
4. Check **Reproductive Notes** for breeding history

---

### 2. 🥛 Milking Records

**What to explore:**

- Daily milking sessions (Pagi, Siang, Malam)
- Milk composition analysis (fat, protein, lactose, total solids)
- Production trends per cow and per herd

**Demo Data Highlights:**

- **205 milking records** spanning 14 days
- **3 daily sessions** for each of 5 lactating cows
- Realistic volume variations (10-16L per session)
- Component tracking for quality monitoring

**Try this:**

1. Go to **Milking** → **Records**
2. Filter by cow: **Garut 2** (highest producer)
3. Compare **Pagi** vs **Malam** sessions
4. Check **Fat %** trends - notice Jersey cow (Putri) has higher butterfat

**Pro tip:** Look for cows with declining production - may indicate health issues!

---

### 3. 📦 Milk Collection (Sales)

**What to explore:**

- Daily milk collection by buyers
- Aggregate volume and quality metrics
- Buyer rotation and relationships

**Demo Data Highlights:**

- **14 days** of collection records
- **4 different buyers**: Kansas Dairy, Green Fields, Fresh Milk Co, Organic Dairy Ltd
- Daily totals: ~150-200L average
- Quality averages tracked (fat, protein)

**Try this:**

1. Navigate to **Milk Collection**
2. Review daily totals and compare with individual milking records
3. Check which buyer collects on which day
4. Verify quality averages match individual cow data

---

### 4. 📏 Cow Measurements

**What to explore:**

- Monthly weight tracking
- Body measurements (length, chest circumference)
- Growth trends and body condition scoring

**Demo Data Highlights:**

- **6 months** of historical data
- **10 active cows** tracked (excludes sold cow)
- Realistic weight changes:
  - Bulls gain ~8kg/month
  - Cows gain ~5kg/month
  - Pregnancy weight gain visible

**Try this:**

1. Go to **Cows** → Select **Bumi** (the bull)
2. View **Measurements** tab
3. Notice steeper weight gain curve vs cows
4. Compare **Garut 1** (lactating) vs **Malang 1** (pregnant) weight trends

---

### 5. 🌡️ Environmental Monitoring

**What to explore:**

- Daily temperature ranges (min/max)
- Humidity tracking
- **THI (Temperature Humidity Index)** - heat stress indicator
- Weather event tracking (thunderstorms)

**Demo Data Highlights:**

- **30 days** of environmental data
- Realistic weather patterns with 7-day cycles
- THI calculations for heat stress monitoring
- Thunderstorm events every 10 days

**Try this:**

1. Navigate to **Environment** → **Data**
2. Check THI values - anything >72 indicates heat stress risk
3. Correlate high THI days with milk production drops
4. Review thunderstorm days and note any pattern changes

**Why it matters:** Heat stress reduces milk production and affects breeding success!

---

### 6. 📅 Farm Events (Health & Management)

**What to explore:**

- All 8 event types in action
- Veterinary care records
- Breeding schedules and follow-ups
- Preventive care tracking

**Demo Data Highlights:**

| Event Type | Count | Examples |
|------------|-------|----------|
| **Pemeriksaan Kesehatan** | 2 | Routine checkups, post-calving exams |
| **Pengawinan** | 3 | AI procedures, heat detection |
| **Penimbangan** | 2 | Monthly weight checks |
| **Vaksinasi** | 3 | FMD booster, HS vaccine, quarantine protocol |
| **Pengobatan** | 2 | Mastitis treatment, hoof injury care |
| **Melahirkan** | 2 | Successful calvings with calf details |
| **Pemberian Cacing** | 2 | Routine deworming |
| **Pemotongan Kuku** | 2 | Hoof trimming (preventive & regular) |

**Try this:**

1. Go to **Events** → **Calendar** or **List**
2. Filter by type: **Pengawinan** to see breeding schedule
3. Check **follow-up dates** - see how reminders work
4. Review **Melahirkan** events - note calf health and birth weights
5. Look at **Vet assignments** - drh. Santoso handles most cases

**Pro tip:** Use events to track vaccination schedules and avoid missed boosters!

---

## 🎯 Demo Scenarios

### Scenario 1: Daily Farm Operations

**Role:** Worker (`worker@farm.local`)

1. **Morning (Pagi session):**
   - Record milking for all lactating cows
   - Note any unusual milk quality
   - Check cow health during milking

2. **Throughout the day:**
   - Monitor environmental conditions
   - Check THI for heat stress
   - Adjust ventilation if needed

3. **Evening:**
   - Complete Siang and Malam sessions
   - Review daily milk collection totals
   - Prepare buyer collection

---

### Scenario 2: Health Management

**Role:** Vet (`vet@farm.local`)

1. **Review upcoming events:**
   - Check follow-ups from previous treatments
   - Schedule vaccinations due this month

2. **Examine specific cows:**
   - **Garut 3**: Recent mastitis treatment - check recovery
   - **Malang 1**: 6 months pregnant - monitor weight gain
   - **Isolasi**: New arrival - complete quarantine protocol

3. **Plan preventive care:**
   - Schedule deworming for cows due
   - Plan hoof trimming for breeding bull
   - Review vaccination calendar

---

### Scenario 3: Breeding Program

**Role:** Manager (`manager@farm.local`)

1. **Review reproductive status:**
   - Check cows in heat (AB 1 - heat detection positive)
   - Monitor pregnant cows (Malang 1 - due in 3 months)
   - Track dry cows preparing for calving

2. **Plan breeding schedule:**
   - Schedule AI for Garut 2 (follow-up due)
   - Coordinate with vet for procedures
   - Update reproductive notes post-procedure

3. **Track outcomes:**
   - Record successful calvings
   - Monitor calf health
   - Plan dry-off dates for lactating cows

---

### Scenario 4: Production Analysis

**Role:** Admin (`admin@farm.local`)

1. **Analyze milk production:**
   - Compare 14-day trends across cows
   - Identify top producers (Garut 2, AB 1)
   - Investigate low producers for health issues

2. **Review quality metrics:**
   - Check butterfat percentages
   - Monitor protein levels
   - Compare against buyer requirements

3. **Business insights:**
   - Calculate total milk sold (14 days × daily collections)
   - Analyze buyer rotation and relationships
   - Correlate environmental stress with production drops

---

## 🔍 Data Relationships to Explore

### Cow Lifecycle Example: **Garut 1**

```
Birth (2020-03-12)
  ↓
First Breeding (AB1, AB3)
  ↓
First Calving (120 days ago - male calf)
  ↓
Lactation Period (current - Lactation 2)
  ↓
Daily Milking (3 sessions × 14 days = 42 records)
  ↓
Monthly Weight Checks (6 measurements)
  ↓
Health Events (vaccinations, checkups)
```

### Milk Production Chain

```
Individual Milking (205 records)
  ↓
Daily Aggregation
  ↓
Quality Averages (fat, protein)
  ↓
Buyer Collection (14 records)
  ↓
Revenue Tracking
```

---

## 📊 Key Metrics to Watch

### Production Metrics

- **Daily milk volume per cow**: Target 30-40L/day (3 sessions)
- **Butterfat %**: Jersey cows >4.0%, FH ~3.8%
- **Protein %**: Target >3.2%
- **Total solids**: Indicator of milk quality

### Health Metrics

- **THI > 72**: Heat stress risk - reduce production
- **Weight loss in lactating cows**: Check nutrition
- **Missed milking sessions**: Health alert
- **Event follow-ups due**: Preventive care tracker

### Reproductive Metrics

- **Days since last breeding**: Track cycling
- **Pregnancy confirmation**: 60-90 days post-AI
- **Dry period**: 60 days before expected calving
- **Calving interval**: Target 12-13 months

---

## 🛠️ Reset Demo Data

Want to start fresh?

```bash
npm run db:reset
```

This will:

1. Drop all tables
2. Regenerate migrations
3. Re-seed all demo data

---

## 📚 Additional Resources

- **README.md** - Project overview and setup
- **QUICK_REFERENCE.md** - Command cheat sheet
- **tasks/GAP_ANALYSIS.md** - Feature roadmap
- **drizzle/schema.ts** - Database structure

---

## 🎉 Ready to Explore

You now have access to a fully-populated demo farm with:

- ✅ Realistic cow population
- ✅ 2 weeks of production history
- ✅ 6 months of weight tracking
- ✅ Complete health event records
- ✅ Environmental monitoring
- ✅ Sales/collection tracking

**Start exploring at: http://localhost:7500**

Happy farming! 🐄🚜
