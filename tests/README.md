# Playwright E2E Tests for Ternak

This folder contains end-to-end tests for the Ternak cattle farm management application using Playwright.

## Setup

Tests are automatically configured when you run `npm install`. Playwright and Chromium browser are installed as dev dependencies.

## Running Tests

### Run all tests
```bash
npm run test
```

### Run tests with browser UI (headed mode)
```bash
npm run test:headed
```

### Run tests with Playwright UI
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test tests/e2e/ternak.spec.ts
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
```

## Test Structure

```
tests/
├── e2e/                      # End-to-end test specifications
│   ├── ternak.spec.ts        # Herd management tests
│   ├── milking.spec.ts       # Daily milking navigation tests
│   ├── milking-save.spec.ts  # Milking save functionality tests
│   ├── notes-api.spec.ts     # Notes editing API tests
│   ├── environment-api.spec.ts # Environmental data API tests
│   └── api-payload.spec.ts   # API payload validation tests
├── fixtures/                 # Test fixtures and page objects
│   ├── auth-fixture.ts       # Authentication fixture
│   └── page-objects.ts       # Page Object Model classes
└── playwright.config.ts      # Playwright configuration
```

## Test Data Cleanup

Tests automatically clean up after themselves:
- API tests track created IDs and delete them in `afterAll` hook
- UI tests track created cow tags and delete them after test suite
- Cleanup runs even if tests fail

**Note:** If tests are interrupted (Ctrl+C), some test data may remain. Run this to clean up:

```bash
# Find and delete test cows (tags starting with TEST- or API-)
psql <connection_string> -c "DELETE FROM cows WHERE tag LIKE 'TEST-%' OR tag LIKE 'API-%';"
```

## Test Credentials

Tests use the seeded admin user:
- **Email:** `admin@farm.local`
- **Password:** `admin123`

## Available Tests

### Ternak (Herd) Management (`ternak.spec.ts`)
- Dashboard display verification
- Add new cow with complete payload (including body measurements)
- Required field validation
- Body measurement fields verification

### Daily Milking Entry (`milking.spec.ts`)
- Milking table display
- Environmental data with THI calculation
- Complete milking payload submission

### API Payload Tests (`api-payload.spec.ts`)
- POST /api/cows with body measurements
- POST /api/milking with milk quality fields
- POST /api/environment with environmental data
- GET endpoints data completeness

## Page Objects

### `TernakPage`
Main page object for herd management:
- `goto()` - Navigate to home
- `openAddCowModal()` - Open add cow modal
- `fillCowForm(data)` - Fill cow form with data
- `submitCowForm()` - Submit cow form

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- Base URL: `http://localhost:7500`
- Auto-starts dev server before tests
- Runs tests in parallel (when not on CI)
- HTML report generation

## Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## CI/CD Integration

For CI environments:
- Tests run in serial mode (one worker)
- 2 retries on failure
- Trace collection on first retry

## Troubleshooting

### Tests timeout waiting for login
Ensure the dev server is running and the database is seeded:
```bash
npm run db:seed
npm run dev
```

### Tests can't find elements
- Check if the page has loaded completely
- Verify the selector matches the actual DOM
- Use `test:debug` mode to inspect elements

### Authentication issues
- Verify admin user exists in database
- Check credentials match the seeded user
- Ensure cookies are being sent with requests
