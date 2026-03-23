import React, { ReactNode } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
  col?: number;
}

export function Field({ label, children, col = 1 }: FieldProps) {
  return (
    <div style={{ gridColumn: `span ${col}` }}>
      <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a7d6b', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
