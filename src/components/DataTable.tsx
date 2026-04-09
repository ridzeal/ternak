'use client';

import React from 'react';
import { Button } from '@/components/Button';
import { statusStyle, sessionStyle, eventIcon } from '@/styles/theme';
import { todayStr } from '@/lib/utils';

export type Column<T = any> = {
  header: string;
  key: string;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
  mobile?: {
    label: string;
    render?: (item: T) => React.ReactNode;
  };
};

export interface DataTableProps<T> {
  title: string;
  subtitle: string;
  icon?: string;
  data: T[];
  columns: Column<T>[];
  onAdd: () => void;
  onRowClick: (item: T) => void;
  onDelete: (item: T) => void;
  rowIcon?: (item: T) => string;
  rowTitle?: (item: T) => string;
  rowSubtitle?: (item: T) => string;
  emptyMessage?: string;
  loading?: boolean;
}

function renderCellValue(item: any, value: any): React.ReactNode {
  if (value === null || value === undefined || value === '' || value === '-') {
    return <span style={{ color: '#a0a0a0' }}>—</span>;
  }
  return String(value);
}

export function DataTable<T extends { id: string }>({
  title,
  subtitle,
  icon = '📋',
  data,
  columns,
  onAdd,
  onRowClick,
  onDelete,
  rowIcon,
  rowTitle,
  rowSubtitle,
  emptyMessage = 'Belum ada data.',
  loading = false,
}: DataTableProps<T>) {
  return (
    <div className="fade" style={{ width: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>{title}</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--fs-lg)', color: '#8a7d6b', marginTop: 3 }}>{subtitle}</p>
        </div>
        <Button onClick={onAdd}>+ Tambah</Button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#8a7d6b', fontFamily: 'monospace' }}>Memuat data...</div>
      ) : data.length === 0 ? (
        <div style={{
          padding: 48,
          textAlign: 'center',
          color: '#8a7d6b',
          fontSize: 14,
          background: '#faf6ee',
          borderRadius: 14,
          border: '1px solid #e0d4c0',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
          {emptyMessage}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="mobile-hide" style={{
            background: '#faf6ee',
            borderRadius: 14,
            border: '1px solid #e0d4c0',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: (rowIcon ? '44px ' : '') + columns.map(c => c.width || '1fr').join(' '),
              gap: 14,
              padding: '18px 20px',
              borderBottom: '1.5px solid #e8e0d4'
            }}>
              {rowIcon && <div key="icon" className="table-header"></div>}
              {columns.map((col, i) => (
                <div key={col.key || i} className="table-header">{col.header}</div>
              ))}
            </div>
            {data.map((item, i) => (
              <div
                key={item.id}
                className="row table-padding"
                onClick={() => onRowClick(item)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: (rowIcon ? '44px ' : '') + columns.map(c => c.width || '1fr').join(' '),
                  gap: 14,
                  alignItems: 'center',
                  borderBottom: i < data.length - 1 ? '1px solid #ede7dc' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0e8d8'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                {rowIcon && (
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#f0e4d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    border: '1.5px solid #e0d0b8'
                  }}>
                    {rowIcon(item)}
                  </div>
                )}
                {columns.map((col) => (
                  <div key={col.key}>
                    {col.render ? col.render(item, i) : renderCellValue(item, (item as any)[col.key])}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile Card View */}
          <div className="mobile-card" style={{ display: 'none', width: '100%', overflowX: 'hidden' }}>
            {data.map((item) => (
              <div
                key={item.id}
                className="mobile-card-item"
                onClick={() => onRowClick(item)}
                style={{ cursor: 'pointer' }}
              >
                {/* Header with icon and title */}
                <div className="mobile-card-header">
                  <div className="mobile-card-icon">
                    {rowIcon ? rowIcon(item) : icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mobile-card-title" style={{ wordBreak: 'break-word' }}>
                      {rowTitle ? rowTitle(item) : (item as any).name || (item as any).title || item.id}
                    </div>
                    <div className="mobile-card-subtitle" style={{ wordBreak: 'break-all' }}>
                      {rowSubtitle ? rowSubtitle(item) : item.id}
                    </div>
                  </div>
                </div>

                {/* Info content */}
                <div style={{ marginTop: 10 }}>
                  {columns.map((col) => col.mobile && (
                    <div key={col.key} style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                      <span style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6 }}>{col.mobile.label}</span>
                      {col.mobile.render ? col.mobile.render(item) : renderCellValue(item, (item as any)[col.key])}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
