import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the main Ternak dashboard page
 */
export class TernakPage {
  readonly page: Page;
  readonly addCowButton: Locator;
  readonly cowTable: Locator;
  readonly modal: Locator;

  constructor(page: Page) {
    this.page = page;
    // More flexible selector for add cow button
    this.addCowButton = page.locator('button:has-text("Daftarkan Sapi"), button:has-text("Tambah Ternak"), button:has-text("+ Tambah")');
    this.cowTable = page.locator('table, [class*="mobile-hide"]').first();
    this.modal = page.locator('[role="dialog"], [class*="Modal"], div:has(input[name="name"])');
  }

  async goto() {
    await this.page.goto('/');
  }

  async openAddCowModal() {
    await this.addCowButton.click();
    // Wait for any form field to appear
    await this.page.waitForSelector('input[name="name"], input[placeholder*="nama"]', { timeout: 5000 });
  }

  async fillCowForm(cowData: {
    name: string;
    tag: string;
    breed: string;
    gender: string;
    dob: string;
    weight: number;
    length?: number;
    chestCircumference?: number;
    reproductiveNotes?: string;
  }) {
    // Use more flexible selectors
    await this.page.fill('input[name="name"], input[placeholder*="nama"], input[placeholder*="Nama"]', cowData.name);
    await this.page.fill('input[name="tag"], input[placeholder*="tag"], input[placeholder*="Tag"]', cowData.tag);
    
    // Select breed
    const breedSelect = this.page.locator('select[name="breed"], select:has-text("Friesian")');
    if (await breedSelect.count() > 0) {
      await breedSelect.selectOption(cowData.breed);
    }
    
    // Select gender
    const genderSelect = this.page.locator('select[name="gender"], select:has-text("Betina")');
    if (await genderSelect.count() > 0) {
      await genderSelect.selectOption(cowData.gender);
    }
    
    // Fill date
    await this.page.fill('input[name="dob"], input[type="date"]', cowData.dob);
    await this.page.fill('input[name="weight"], input[placeholder*="berat"], input[placeholder*="Berat"]', cowData.weight.toString());
    
    // Fill body measurements if provided
    if (cowData.length !== undefined) {
      await this.page.fill('input[name="length"], input[placeholder*="panjang"], input[placeholder*="Panjang"]', cowData.length.toString());
    }
    if (cowData.chestCircumference !== undefined) {
      await this.page.fill('input[name="chestCircumference"], input[placeholder*="lingkar"], input[placeholder*="Lingkar"]', cowData.chestCircumference.toString());
    }
    if (cowData.reproductiveNotes !== undefined) {
      await this.page.fill('textarea[name="reproductiveNotes"], textarea[placeholder*="keterangan"], textarea[placeholder*="Keterangan"]', cowData.reproductiveNotes);
    }
  }

  async submitCowForm() {
    const submitButton = this.page.locator('button[type="submit"], button:has-text("Simpan"), button:has-text("Daftarkan")');
    await submitButton.click();
  }

  async getCowRow(cowTag: string): Promise<Locator | null> {
    const rows = this.cowTable.locator('tr, div[style*="grid"], [class*="row"]');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = await row.textContent();
      if (text?.includes(cowTag)) {
        return row;
      }
    }
    return null;
  }
}
