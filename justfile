# Ternak - Cattle Farm Manager
# Quick commands for demo development

# Development
dev:
    npm run dev -- -p 7500

build:
    npm run build

start:
    npm start

lint:
    npm run lint

# Database - Migration (safe, preserves data)
migrate:
    npm run db:migrate

db-mig:
    npm run db:mig

db-gen:
    npm run db:gen

# Database - Reset (DANGER: Wipes everything + demo data)
reset:
    npm run db:reset

db-reset:
    npm run db:reset

# Database - Setup (fresh install + demo data)
setup:
    npm run init

init:
    npm run init

# Authentication
create-admin:
    npm run create-admin

# Seed data only (add demo data to existing DB)
seed:
    npm run db:seed

# Testing
test:
    npm run test

test-headed:
    npm run test:headed

test-ui:
    npm run test:ui

test-debug:
    npm run test:debug
