# Phase 2: Inventory & Assets Management

**Goal:** Build inventory management modules for assets and feed stock.

**Timeline:** Week 3

---

## Task 2.1: Create Asset Inventory Module

**Priority:** Medium  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/app/api/assets/`, `src/components/AssetInventory.tsx`

### Database Schema

```typescript
export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),           // "Mesin cooling", "Motor Roda 2", etc.
  category: text('category'),             // "Machinery", "Vehicle", "Equipment"
  purchaseDate: text('purchase_date'),    // "Tanggal Pembelian"
  quantity: integer('quantity').notNull(),
  unit: text('unit'),                     // "Unit", "Set", "Piece"
  notes: text('notes'),                   // "Keterangan"
  status: text('status', { 
    enum: ['Active', 'Maintenance', 'Retired', 'Lost'] 
  }).default('Active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
```

### API Endpoints

- `GET /api/assets` - List all assets
- `POST /api/assets` - Add new asset
- `PUT /api/assets` - Update asset
- `DELETE /api/assets?id=xxx` - Delete asset
- `GET /api/assets/stats` - Get inventory statistics

### UI Components

1. **Asset List View**:
   - Table with columns: No, Nama Barang, Category, Tanggal Pembelian, Quantity, Unit, Keterangan
   - Search/filter by category
   - Status indicators

2. **Add/Edit Asset Modal**:
   - Form with all fields
   - Category dropdown
   - Date picker for purchase date

3. **Asset Dashboard**:
   - Total assets count
   - Assets by category
   - Recent additions

### Acceptance Criteria
- [ ] Can add, edit, delete assets
- [ ] Matches Excel "Daftar Barang-Barang Inventory" format
- [ ] Category filtering works
- [ ] Purchase date tracking functional
- [ ] Quantity and unit tracked correctly

---

## Task 2.2: Create Feed Inventory Module

**Priority:** High  
**Complexity:** Medium  
**Files:** `src/db/schema.ts`, `src/types/index.ts`, `src/app/api/feed-inventory/`, `src/components/FeedInventory.tsx`

### Database Schema

```typescript
export const feedInventory = pgTable('feed_inventory', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),           // Feed name
  purchaseDate: text('purchase_date'),    // "Tanggal Pembelian"
  quantity: integer('quantity'),          // Number of bags/units
  weightKg: decimal('weight_kg'),         // "Jumlah (Kg/Ton)"
  unit: text('unit'),                     // "Kg", "Ton", "Bag"
  unitPrice: decimal('unit_price'),       // Price per unit (optional)
  totalPrice: decimal('total_price'),     // Total cost (optional)
  expiryDate: text('expiry_date'),        // Track freshness
  supplier: text('supplier'),             // Supplier name (optional)
  notes: text('notes'),                   // "Keterangan"
  currentStock: integer('current_stock'), // Remaining quantity
  minStock: integer('min_stock'),         // Reorder point
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
```

### API Endpoints

- `GET /api/feed-inventory` - List all feed inventory
- `POST /api/feed-inventory` - Add new feed item
- `PUT /api/feed-inventory` - Update feed item
- `DELETE /api/feed-inventory?id=xxx` - Delete feed item
- `PUT /api/feed-inventory/use` - Record usage (decrease stock)
- `GET /api/feed-inventory/low-stock` - Get items below min stock

### UI Components

1. **Feed Inventory List View**:
   - Table matching Excel "INVENTORIS STOK CADANGAN PAKAN SAPI"
   - Columns: No, Tanggal Pembelian, Jumlah, Nama, Jumlah (Kg/Ton), Keterangan
   - Stock level indicators
   - Low stock alerts

2. **Add/Edit Feed Modal**:
   - Form with all fields
   - Auto-calculate total price
   - Expiry date warnings

3. **Usage Tracking**:
   - Record feed usage
   - Update current stock
   - Usage history log

4. **Feed Dashboard**:
   - Total stock value
   - Low stock alerts
   - Expiring soon alerts
   - Usage trends

### Acceptance Criteria
- [ ] Can add, edit, delete feed inventory
- [ ] Matches Excel "Inventoris pakan sapi" format
- [ ] Weight tracking (Kg/Ton) works
- [ ] Stock level monitoring
- [ ] Low stock alerts functional
- [ ] Usage tracking reduces stock

---

## Task 2.3: Add Inventory Usage Tracking

**Priority:** Medium  
**Complexity:** Low  
**Files:** `src/db/schema.ts`, `src/app/api/inventory-usage/`

### Database Schema

```typescript
export const inventoryUsage = pgTable('inventory_usage', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull(),
  itemType: text('item_type', { 
    enum: ['feed', 'asset'] 
  }).notNull(),
  date: text('date').notNull(),
  quantity: integer('quantity').notNull(),
  weightKg: decimal('weight_kg'),
  purpose: text('purpose'),              // What was it used for
  notes: text('notes'),
  recordedBy: text('recorded_by'),
});
```

### API Endpoints

- `GET /api/inventory-usage?itemId=xxx` - Get usage history for item
- `POST /api/inventory-usage` - Record usage
- `DELETE /api/inventory-usage?id=xxx` - Remove usage record

### UI Components

1. **Record Usage Modal**:
   - Item selector
   - Quantity/weight input
   - Purpose field
   - Date selector

2. **Usage History View**:
   - List of all usage records
   - Filter by item, date range
   - Usage statistics

### Acceptance Criteria
- [ ] Can record inventory usage
- [ ] Usage automatically reduces stock
- [ ] Usage history tracked
- [ ] Can view usage by item

---

## Task 2.4: Create Inventory Dashboard

**Priority:** Medium  
**Complexity:** Low  
**Files:** `src/components/InventoryDashboard.tsx`

### Components

1. **Summary Cards**:
   - Total asset count
   - Total feed items
   - Low stock alerts count
   - Items expiring soon

2. **Charts**:
   - Assets by category (pie chart)
   - Feed stock levels (bar chart)
   - Usage trends (line chart)

3. **Quick Actions**:
   - Add new asset
   - Add new feed
   - Record usage
   - View all inventory

### Acceptance Criteria
- [ ] Dashboard shows all key metrics
- [ ] Alerts visible for low stock
- [ ] Quick actions accessible
- [ ] Charts render correctly

---

## Task 2.5: Add Asset Maintenance Tracking

**Priority:** Low  
**Complexity:** Low  
**Files:** `src/db/schema.ts`, `src/app/api/asset-maintenance/`

### Database Schema

```typescript
export const assetMaintenance = pgTable('asset_maintenance', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  date: text('date').notNull(),
  type: text('type', {
    enum: ['Routine', 'Repair', 'Inspection', 'Replacement']
  }).notNull(),
  description: text('description').notNull(),
  cost: decimal('cost'),
  vendor: text('vendor'),
  nextMaintenance: text('next_maintenance'),
  notes: text('notes'),
});
```

### UI Components

1. **Maintenance Log**:
   - List of maintenance records per asset
   - Add maintenance record modal
   - Next maintenance reminders

### Acceptance Criteria
- [ ] Can record maintenance activities
- [ ] Maintenance history per asset
- [ ] Reminders for scheduled maintenance

---

## Definition of Done (Phase 2)

- [ ] All 5 tasks completed
- [ ] Asset inventory fully functional
- [ ] Feed inventory fully functional
- [ ] Usage tracking works correctly
- [ ] Dashboard displays all metrics
- [ ] Low stock alerts working
- [ ] Data matches Excel format
- [ ] Code reviewed and merged

---

## Testing Checklist

- [ ] Can add new asset with all fields
- [ ] Can add new feed inventory with weight
- [ ] Recording usage reduces stock correctly
- [ ] Low stock alerts appear when appropriate
- [ ] Dashboard shows correct totals
- [ ] Asset categories filter correctly
- [ ] Feed expiry alerts work
- [ ] Maintenance records save correctly

---

*Phase 2 of 5 - Inventory & Assets*
