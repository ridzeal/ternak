# Phase 4: Reporting & Export

**Goal:** Build comprehensive reporting system matching Excel formats with export capabilities.

**Timeline:** Week 5

---

## Task 4.1: Create Daily Milk Report (Excel Format Match)

**Priority:** High  
**Complexity:** High  
**Files:** `src/components/reports/DailyMilkReport.tsx`, `src/app/reports/daily-milk/`

### Requirements

Create a report that exactly matches the Excel "AB Susu Harian" format:

**Header Section:**
- Title: "LAPORAN SUSU HARIAN"
- Date selector
- Environmental data:
  - Suhu min / Suhu max
  - Kelembaban (Humidity)
  - THI (auto-calculated)
  - Petir Ya/Tidak (Thunderstorm)

**Table Columns:**
1. No (Sequence number)
2. Nama (Cow name)
3. Perahan 1 (Milking 1 volume)
4. Perahan 2 (Milking 2 volume)
5. Perahan 3 (Milking 3 volume)
6. Total (Sum of 3 sessions)
7. Panjang (Body length)
8. Lingkar dada (Chest circumference)
9. Berat (Weight)
10. Keterangan (Notes - reproductive status, etc.)

**Footer Section:**
- Total production
- Average per cow
- Summary statistics

### UI Features

1. **Date Selector**:
   - Calendar picker
   - Quick navigate to today/yesterday
   - Show available dates with data

2. **Environmental Header**:
   - Display recorded environmental data
   - Edit button to add/update if missing
   - THI auto-calculated and displayed

3. **Data Table**:
   - Sortable columns
   - Filter by cow status (lactating only by default)
   - Expandable rows for cow details
   - Inline editing capability

4. **Actions**:
   - Export to Excel (.xlsx)
   - Print view
   - PDF export
   - Email report (future)

### Acceptance Criteria
- [ ] Report layout matches Excel exactly
- [ ] All columns present and correctly labeled
- [ ] Environmental data displayed in header
- [ ] Totals calculated correctly
- [ ] Export to Excel preserves formatting
- [ ] Print view formatted correctly

---

## Task 4.2: Create Monthly Milk Summary Report

**Priority:** High  
**Complexity:** High  
**Files:** `src/components/reports/MonthlyMilkReport.tsx`, `src/app/reports/monthly-milk/`

### Requirements

Match Excel "AB Susu bulanan" format:

**Header:**
- Title: "HASIL SUSU PER BULAN (dlm kg) - [MONTH] - [YEAR]"

**Table Columns:**
1. No (Sequence)
2. Hari (Day of week)
3. Tanggal (Date)
4. Jumlah sapi (Total cattle count)
5. Jumlah sapi laktasi (Lactating cattle count)
6. THI (%)
7. Petir Y/T (Thunderstorm)
8. Berat rata2 (Average weight)
9. Perahan 1
10. Perahan 2
11. Perahan 3
12. Total
13. Rata2 p. sapi p. hari (Average per cow per day)
14. Diterima oleh Kansas (Received by buyer)
15. Fat: 3.8-4.2%
16. Lactose: min. 4.5%
17. Protein: min. 3%
18. Total solids: 12.5-13.5%
19. Catatan (Notes)

### Features

1. **Month/Year Selector**:
   - Dropdown for month
   - Input for year
   - Generate button

2. **Auto-Aggregation**:
   - Pull daily data and aggregate
   - Calculate monthly averages
   - Count cattle per day
   - Average quality metrics

3. **Quality Summary**:
   - Monthly fat average
   - Monthly protein average
   - Quality trend analysis

4. **Collection Summary**:
   - Total milk collected
   - Collection by buyer
   - Reconciliation with production

### Acceptance Criteria
- [ ] Report matches Excel monthly format
- [ ] Daily data aggregated correctly
- [ ] Quality metrics included
- [ ] Collection tracking shown
- [ ] Monthly totals accurate
- [ ] Export to Excel works

---

## Task 4.3: Create Excel Export Functionality

**Priority:** High  
**Complexity:** High  
**Files:** `src/lib/excel-export.ts`, `src/app/api/export/`

### Technical Implementation

**Library Options:**
- `xlsx` (SheetJS) - Most popular, comprehensive
- `exceljs` - Advanced formatting support
- `excel-export` - Lightweight

**Recommended:** `exceljs` for formatting control

### Features

1. **Daily Report Export**:
   ```typescript
   exportDailyReport(date: string, data: DailyReportData): Promise<Buffer>
   ```
   - Match Excel formatting exactly
   - Include headers, borders, colors
   - Auto-fit columns
   - Freeze header rows

2. **Monthly Report Export**:
   ```typescript
   exportMonthlyReport(year: number, month: number, data: MonthlyReportData): Promise<Buffer>
   ```
   - Multi-sheet support (daily + summary)
   - Formulas for calculations
   - Conditional formatting for alerts

3. **Custom Export Builder**:
   - Select date range
   - Choose data types
   - Custom column selection
   - Save export templates

### File Structure

```typescript
// src/lib/excel-export.ts
import Excel from 'exceljs';

export class FarmReportExporter {
  workbook: Excel.Workbook;
  
  constructor() {
    this.workbook = new Excel.Workbook();
  }
  
  async exportDailyMilkReport(data: DailyReportData): Promise<Buffer> {
    const worksheet = this.workbook.addWorksheet('AB Susu Harian');
    
    // Setup columns with widths
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 15 },
      { header: 'Perahan 1', key: 'perahan1', width: 12 },
      // ... more columns
    ];
    
    // Add environmental header
    this.addEnvironmentalHeader(worksheet, data.environmental);
    
    // Add data rows
    data.cows.forEach((cow, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: cow.name,
        perahan1: cow.session1,
        // ...
      });
    });
    
    // Apply styling
    this.applyTableStyles(worksheet);
    
    return this.workbook.xlsx.writeBuffer();
  }
}
```

### Acceptance Criteria
- [ ] Excel files export correctly
- [ ] Formatting preserved (colors, borders, fonts)
- [ ] Column widths appropriate
- [ ] Headers frozen
- [ ] Formulas work in exported file
- [ ] Large datasets export without timeout
- [ ] File downloads correctly in browser

---

## Task 4.4: Create Report Dashboard

**Priority:** Medium  
**Complexity:** Medium  
**Files:** `src/components/reports/ReportDashboard.tsx`, `src/app/reports/`

### Features

1. **Report Catalog**:
   - List all available reports
   - Description and preview
   - Last generated date
   - Quick generate button

2. **Report Categories**:
   - **Daily Operations**
     - Daily Milk Report
     - Environmental Report
     - Feeding Report
   - **Monthly Summaries**
     - Monthly Milk Production
     - Herd Statistics
     - Quality Summary
   - **Inventory**
     - Asset List
     - Feed Inventory
     - Usage Report
   - **Land Management**
     - Plot Status Report
     - Harvest History
     - Cut Cycle Report

3. **Scheduled Reports**:
   - Set up automatic generation
   - Email delivery (future)
   - Save to folder (future)

4. **Report History**:
   - Previously generated reports
   - Download again
   - Delete old reports

### Acceptance Criteria
- [ ] All reports accessible from dashboard
- [ ] Report categories organized
- [ ] Generation status visible
- [ ] History maintained
- [ ] Quick actions available

---

## Task 4.5: Add Print-Friendly Layouts

**Priority:** Medium  
**Complexity:** Low  
**Files:** `src/styles/print.css`, `src/components/reports/PrintLayout.tsx`

### Requirements

1. **Print Stylesheet**:
   ```css
   @media print {
     .no-print { display: none; }
     .report-container { 
       width: 100%;
       max-width: none;
       padding: 0;
     }
     table { 
       page-break-inside: auto;
       font-size: 10pt;
     }
     tr { 
       page-break-inside: avoid; 
       page-break-after: auto; 
     }
   }
   ```

2. **Print Layout Component**:
   - Remove navigation
   - Remove buttons
   - Optimize for A4 paper
   - Add print date footer
   - Page numbers

3. **Print Preview**:
   - Show how report will look printed
   - Page break indicators
   - Adjust scaling option

### Acceptance Criteria
- [ ] Print view removes UI chrome
- [ ] Tables format correctly on pages
- [ ] Page breaks appropriate
- [ ] A4 size optimized
- [ ] Print button triggers browser print

---

## Task 4.6: Create Data Migration Tool from Excel

**Priority:** High  
**Complexity:** High  
**Files:** `src/app/api/import/excel/`, `src/lib/excel-import.ts`

### Features

1. **Excel File Upload**:
   - Drag and drop zone
   - File type validation
   - Preview before import

2. **Sheet Mapping**:
   - Auto-detect sheet structure
   - Map columns to database fields
   - Preview mapped data

3. **Data Validation**:
   - Check for duplicates
   - Validate data types
   - Flag inconsistencies
   - Show import summary

4. **Import Process**:
   - Transaction-based import
   - Progress indicator
   - Rollback on error
   - Import log

5. **Import Templates**:
   - Provide template Excel files
   - Match user's current format
   - Instructions included

### Implementation

```typescript
// src/lib/excel-import.ts
import Excel from 'exceljs';

export async function importDailyMilkReport(
  file: File
): Promise<ImportResult> {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.load(file);
  
  const worksheet = workbook.getWorksheet('AB Susu Harian');
  
  // Parse environmental header
  const environmental = parseEnvironmentalHeader(worksheet);
  
  // Parse cow data rows
  const cows = parseCowData(worksheet);
  
  // Validate
  const validation = validateImportData(cows);
  
  return {
    environmental,
    cows,
    validation,
    rowCount: cows.length,
  };
}
```

### Acceptance Criteria
- [ ] Can upload Excel file
- [ ] Sheets parsed correctly
- [ ] Data mapped to correct fields
- [ ] Validation errors shown
- [ ] Import preview available
- [ ] Data imports to database
- [ ] Rollback works on error
- [ ] Import log maintained

---

## Definition of Done (Phase 4)

- [ ] All 6 tasks completed
- [ ] Daily milk report matches Excel format
- [ ] Monthly summary report functional
- [ ] Excel export working with formatting
- [ ] Report dashboard organized
- [ ] Print layouts optimized
- [ ] Excel import/migration working
- [ ] All reports exportable
- [ ] Code reviewed and merged

---

## Testing Checklist

- [ ] Daily report generates for any date
- [ ] Environmental data displays correctly
- [ ] Monthly aggregation accurate
- [ ] Excel export opens in Excel/Sheets
- [ ] Exported formatting matches preview
- [ ] Print view removes UI elements
- [ ] Excel import parses all sheets
- [ ] Imported data appears in app
- [ ] Import validation catches errors
- [ ] Report dashboard loads quickly

---

*Phase 4 of 5 - Reporting & Export*
