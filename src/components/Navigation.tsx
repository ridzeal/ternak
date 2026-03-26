'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { key: string; label: string; count: number }[];
  onOpenUsers?: () => void;
}

export function Navigation({ activeTab, onTabChange, tabs, onOpenUsers }: NavigationProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      background: '#2e2416',
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      borderBottom: '1px solid #3a2e20',
    }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="nav-icon" style={{ fontSize: '32px' }}>🐄</span>
          <span style={{ color: '#f5f0e8', fontWeight: 600, fontSize: '18px', display: 'none' }} className="mobile-show">Ternak</span>
        </div>

        {/* Desktop Navigation tabs */}
        <div className="desktop-nav" style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className="nav-tab"
              style={{
                background: activeTab === t.key ? '#f5f0e8' : 'transparent',
                color: activeTab === t.key ? '#2e2416' : '#9a8a72',
                borderRadius: 100,
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {t.label} <span className="nav-tab-count">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Desktop User menu - Admin only */}
        {user?.role === 'admin' && (
          <div className="desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <button
              onClick={onOpenUsers}
              style={{
                padding: '8px 16px',
                background: '#3a2e20',
                color: '#f5f0e8',
                border: '1px solid #9a8a72',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'monospace',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              title="User Management"
            >
              👥 Users
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingLeft: 12,
                borderLeft: '1px solid #3a2e20',
              }}
            >
              <span style={{ fontSize: 13, color: '#f5f0e8', fontWeight: 500 }}>{user.name}</span>
              <button
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #9a8a72',
                  color: '#9a8a72',
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Mobile hamburger menu */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle menu"
        >
          <span style={{ fontSize: '24px', color: '#f5f0e8' }}>
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            marginTop: '12px',
            padding: '16px 0',
            borderTop: '1px solid #3a2e20',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeUp 0.2s ease',
          }}
        >
          {/* Mobile tabs */}
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              style={{
                background: activeTab === t.key ? '#f5f0e8' : 'transparent',
                color: activeTab === t.key ? '#2e2416' : '#9a8a72',
                borderRadius: '8px',
                padding: '14px 16px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 500,
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s',
              }}
            >
              {t.label} <span style={{ opacity: 0.5, fontSize: '13px' }}>({t.count})</span>
            </button>
          ))}

          {/* Mobile user menu - Admin only */}
          {user?.role === 'admin' && (
            <>
              <div style={{
                height: '1px',
                background: '#3a2e20',
                margin: '8px 0',
              }} />
              <button
                onClick={() => {
                  onOpenUsers?.();
                  setMobileMenuOpen(false);
                }}
                style={{
                  padding: '14px 16px',
                  background: '#3a2e20',
                  color: '#f5f0e8',
                  border: '1px solid #9a8a72',
                  borderRadius: '8px',
                  fontSize: 14,
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                👥 User Management
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(58, 46, 32, 0.5)',
                borderRadius: '8px',
                marginTop: '4px',
              }}>
                <span style={{ fontSize: 14, color: '#f5f0e8', fontWeight: 500 }}>{user.name}</span>
                <button
                  onClick={logout}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #9a8a72',
                    color: '#f5f0e8',
                    borderRadius: '6px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
