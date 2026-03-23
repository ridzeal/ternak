'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, duration = 2500, onClose }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        background: '#2e2416',
        color: '#f5f0e8',
        padding: '12px 20px',
        borderRadius: 10,
        fontFamily: 'monospace',
        fontSize: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        animation: 'slideRight 0.3s ease',
      }}
    >
      {message}
    </div>
  );
}
