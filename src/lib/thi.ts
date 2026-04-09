/**
 * THI (Temperature Humidity Index) Calculator
 * 
 * THI indicates heat stress in cattle:
 * - THI < 72: No stress
 * - THI 72-79: Mild stress
 * - THI 80-89: Moderate stress
 * - THI >= 90: Severe stress
 * 
 * Formula: THI = (0.8 * T) + ((RH/100) * (T - 14.4)) + 46.4
 */

export type THILevel = 'normal' | 'mild' | 'moderate' | 'severe';

export interface THIStatus {
  level: THILevel;
  color: string;
  label: string;
  recommendation: string;
}

/**
 * Calculate THI from temperature and humidity
 * @param temperature - Temperature in Celsius
 * @param humidity - Relative humidity percentage (0-100)
 * @returns THI value
 */
export function calculateTHI(temperature: number, humidity: number): number {
  return (0.8 * temperature) + ((humidity / 100) * (temperature - 14.4)) + 46.4;
}

/**
 * Get THI status level and recommendations
 * @param thi - THI value
 * @returns THI status object
 */
export function getTHIStatus(thi: number): THIStatus {
  if (thi < 72) {
    return {
      level: 'normal',
      color: '#22c55e',
      label: 'Normal',
      recommendation: 'Kondisi nyaman. Tidak ada tindakan diperlukan.',
    };
  }
  if (thi < 80) {
    return {
      level: 'mild',
      color: '#eab308',
      label: 'Stres Ringan',
      recommendation: 'Berikan akses ke tempat teduh dan pastikan air minum tersedia.',
    };
  }
  if (thi < 90) {
    return {
      level: 'moderate',
      color: '#f97316',
      label: 'Stres Sedang',
      recommendation: 'Aktifkan kipas/sprinkler, kurangi aktivitas fisik sapi.',
    };
  }
  return {
    level: 'severe',
    color: '#ef4444',
    label: 'Stres Berat',
    recommendation: 'DARURAT! Aktifkan semua pendinginan, pantau sapi secara ketat.',
  };
}

/**
 * Get THI recommendation for a range of THI values
 * @param thiMin - Minimum THI
 * @param thiMax - Maximum THI
 * @returns Worst status in the range
 */
export function getTHIRecommendation(thiMin: number, thiMax: number): THIStatus {
  // Return the worst status in the range
  return getTHIStatus(thiMax);
}

/**
 * Format THI display text
 * @param thi - THI value
 * @returns Formatted string
 */
export function formatTHI(thi: number): string {
  return thi.toFixed(1);
}
