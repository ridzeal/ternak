# Ternak - Quick Reference

## 🚀 Demo Mode Commands

### Reset Everything + Demo Data (30 seconds)
```bash
just reset
```
**What it does:**
- 💀 Drops ALL tables (deletes all data)
- 📝 Generates fresh migrations
- 🔧 Applies migrations
- 🌱 Seeds demo data (8 cows, 5 milkings, 4 events)

### Setup Fresh (first time only)
```bash
just setup
```
Same as `just reset`

---

## 📊 Demo Data Included

After running `just reset`:

### Users
| Email | Password | Role |
|-------|----------|------|
| admin@farm.local | admin123 | Admin |

### Cows (8 total)
- Garut 1, 2, 3 (Friesian Holstein, Limousin)
- Malang 1, 2 (Friesian Holstein)
- AB 1, 2 (Friesian Holstein, Limousin)
- Bumi (Simmental Bull)

### Milking Records (5 records - today)
- Today's sessions for lactating cows
- Morning (Pagi) and Afternoon (Siang) sessions

### Farm Events (4 events - today)
- Health check, Breeding, Weighing, Hoof trimming

---

## 🛠️ Other Commands

```bash
# Development
just dev          # Start dev server
just build        # Build for production
just start        # Start production server
just lint         # Run linter

# Database (safe operations)
just migrate      # Apply new migrations (preserves data)
just db-gen       # Generate migration files
just db-mig       # Apply migrations only
just seed         # Add demo data to existing DB

# Authentication
just create-admin # Create admin user only
```

---

## 🎯 Demo Workflow

### 1. Reset Database
```bash
just reset
```

### 2. Start Server
```bash
just dev
```

### 3. Login
Navigate to: http://localhost:3000/login

**Credentials:**
- Email: `admin@farm.local`
- Password: `admin123`

### 4. Demo Features
- ✅ View 8 cows in herd registry
- ✅ See today's milking records
- ✅ View farm events
- ✅ Click "👥 Users" to manage users
- ✅ Create new users (Worker/Manager/Admin)

### 5. Break Something
Go ahead, test features, add data, modify records.

### 6. Recover Instantly
```bash
just reset
```
Back to clean demo state in 30 seconds!

---

## 📁 Files Created by Reset

```
drizzle/
├── 000X_*.sql           # Migration file
└── meta/
    ├── _journal.json    # Migration history
    └── XXXXX_snapshot.json  # Schema snapshot

Database Tables:
├── users                # User accounts
├── sessions             # Login sessions
├── cows                 # Cattle registry
├── milking_records      # Milk production
└── farm_events          # Health/breeding events
```

---

## ⚠️ Warnings

**`just reset` will:**
- ❌ Delete ALL data permanently
- ❌ Remove all user accounts
- ❌ Clear all records

**Always use for:**
- ✅ Demo preparation
- ✅ Development testing
- ✅ Breaking/fixing cycles

**Never use for:**
- ❌ Production database
- ❌ Data you want to keep

---

## 🔧 Troubleshooting

### Command not found
```bash
# Install just: https://github.com/casey/just
# Or use npm directly:
npm run db:reset
npm run db:seed
npm run db:migrate-fresh
```

### Database connection error
```bash
# Check .env file has:
POSTGRES_URL=postgresql://user:pass@localhost:5432/ter
nak
```

### Port already in use
```bash
# Kill Next.js process
# Or use different port:
just dev  # (uses default 3000)
PORT=3001 npm run dev  # Use port 3001 instead
```

---

**Happy Demoing! 🚀**

*Last updated: 2026-03-25*
