// Color palette
export const colors = {
  background: '#f0ead8',
  surface: '#faf6ee',
  surfaceAlt: '#f5f0e8',
  primary: '#2e2416',
  primaryLight: '#3a2e20',
  border: '#e0d4c0',
  borderDark: '#d6cbba',
  text: '#3a2e20',
  textMuted: '#8a7d6b',
  textLight: '#6a5a48',
  white: '#ffffff',
  error: '#c0392b',
  errorLight: '#fdecea',
  errorBorder: '#f1a1a1',
  success: '#2d6a1f',
  successLight: '#e8f5e2',
  successBorder: '#b7dca8',
};

// Status styles for cows
export const statusStyle: Record<string, React.CSSProperties> = {
  Laktasi:    { background: colors.successLight, color: colors.success, border: `1px solid ${colors.successBorder}` },
  Kering:     { background: '#fdf3e3', color: '#7a4f1a', border: '1px solid #f0c98a' },
  Hamil:      { background: '#fce4ec', color: '#880e4f', border: '1px solid #f48fb1' },
  Aktif:      { background: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9' },
  Karantina:  { background: '#fce4ec', color: '#b71c1c', border: '1px solid #ef9a9a' },
  Terjual:    { background: '#f3e5f5', color: '#6a1b9a', border: '1px solid #ce93d8' },
};

// Session styles for milking
export const sessionStyle: Record<string, React.CSSProperties> = {
  Pagi:   { background: '#fdf3e3', color: '#7a4f1a', border: '1px solid #f0c98a' },
  Siang: { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
  Malam:   { background: '#e8eaf6', color: '#283593', border: '1px solid #9fa8da' },
};

// Event icons
export const eventIcon: Record<string, string> = {
  'Pemeriksaan Kesehatan': '🩺',
  'Pengawinan': '🧬',
  'Penimbangan': '⚖️',
  'Vaksinasi': '💉',
  'Pengobatan': '💊',
  'Melahirkan': '🐄',
  'Pemberian Cacing': '🔬',
  'Pemotongan Kuku': '✂️',
};

// Input styles
export const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1.5px solid #d6cbba',
  background: '#faf7f2',
  fontFamily: 'monospace',
  color: '#3a2e20',
  outline: 'none',
  boxSizing: 'border-box',
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
};

// Common component styles
export const cardStyle: React.CSSProperties = {
  background: colors.surface,
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  padding: '16px 18px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

export const buttonPrimaryStyle: React.CSSProperties = {
  background: colors.primary,
  color: colors.surfaceAlt,
  border: 'none',
  cursor: 'pointer',
};

export const buttonSecondaryStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1.5px solid #d6cbba',
  color: colors.textMuted,
  cursor: 'pointer',
};

export const navTabStyle = (active: boolean): React.CSSProperties => ({
  background: active ? colors.surfaceAlt : 'transparent',
  color: active ? colors.primary : '#9a8a72',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
});
