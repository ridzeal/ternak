'use client';

import React, { ReactNode } from 'react';

interface FormSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function FormSidebar({ isOpen, onToggle, title, subtitle, children }: FormSidebarProps) {
  return (
    <div
      style={{
        width: isOpen ? 560 : 0,
        minWidth: isOpen ? 560 : 0,
        maxWidth: isOpen ? 560 : 0,
        background: '#faf6ee',
        borderLeft: isOpen ? '1px solid #e0d4c0' : 'none',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
      }}
    >
      {isOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #ede7dc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexShrink: 0,
              background: '#faf6ee',
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#3a2e20',
                lineHeight: 1.3
              }}>
                {title}
              </h3>
              <p style={{
                margin: '4px 0 0',
                fontSize: '0.875rem',
                color: '#8a7d6b',
              }}>
                {subtitle}
              </p>
            </div>
            <button
              onClick={onToggle}
              style={{
                background: '#f0e4d0',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#8a7d6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px',
                fontSize: '1.125rem',
                flexShrink: 0,
                marginLeft: 12,
              }}
              title="Ciutkan sidebar"
            >
              ◀
            </button>
          </div>

          {/* Content - scrollable */}
          <div
            style={{
              padding: '22px 24px 24px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
