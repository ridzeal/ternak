import React, { ReactNode } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
  col?: number;
}

export function Field({ label, children, col = 1 }: FieldProps) {
  return (
    <div style={{ gridColumn: `span ${col}` }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
