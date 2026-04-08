'use client';

import React, { ReactNode, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function Sidebar({ isOpen, onClose, title, subtitle, children }: SidebarProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,14,6,0.4)',
          zIndex: 150,
          animation: 'fadeIn 0.2s ease',
        }}
      />
      
      {/* Sidebar panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: 560,
          height: '100vh',
          background: '#faf6ee',
          zIndex: 200,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
          animation: 'slideInRight 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e0d4c0',
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
          }}
        >
          <div>
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
            onClick={onClose}
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
          >
            ✕
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
