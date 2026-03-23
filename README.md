# Ternak - Cattle Farm Manager

A modern cattle farm management system built with Next.js and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your PostgreSQL database connection:
   - Create a `.env` file in the root directory
   - Add your database URL:
     ```
     POSTGRES_URL=postgresql://user:password@localhost:5432/ternak
     ```

3. Generate and run database migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

   Or run all database setup commands at once:
   ```bash
   npm run db:setup
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Commands

- `npm run db:generate` - Generate new migration files from schema changes
- `npm run db:migrate` - Run migrations to update the database
- `npm run db:seed` - Seed the database with initial data
- `npm run db:setup` - Run all database setup commands

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   │   ├── cows/         # Cows API
│   │   ├── milking/      # Milking records API
│   │   └── events/       # Farm events API
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
├── context/              # React Context providers
│   └── FarmContext.tsx   # Farm data context
├── db/                   # Database layer
│   ├── index.ts          # Database client
│   ├── schema.ts         # Drizzle ORM schema
│   └── seed.ts           # Database seeding script
├── lib/                  # Utility functions
└── types/                # TypeScript types
```

## Features

- 🐄 **Herd Management**: Track your cattle with detailed information
- 🥛 **Milking Records**: Record and monitor milk production
- 📋 **Farm Events**: Log health checks, breeding, vaccinations, and more
- 📊 **Statistics Dashboard**: Real-time insights into your farm operations
