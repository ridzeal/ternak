import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const baseStyle = {
  border: 'none',
  borderRadius: 100,
  fontFamily: 'monospace',
  letterSpacing: '0.06em',
  transition: 'all 0.2s',
};

const variants = {
  primary: { background: '#2e2416', color: '#f5f0e8' },
  secondary: { background: 'transparent', border: '1.5px solid #d6cbba', color: '#8a7d6b' },
  ghost: { background: 'transparent', color: '#8a7d6b' },
};

const sizes = {
  sm: { padding: '10px 22px' },
  md: { padding: '18px 32px' },
  lg: { padding: '20px 38px' },
};

export function Button({ variant = 'primary', size = 'md', children, style, ...props }: ButtonProps) {
  return (
    <button
      style={{
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
