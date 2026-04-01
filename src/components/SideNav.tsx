'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SideNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { key: string; label: string; icon: string; count: number }[];
  onOpenUsers?: () => void;
}

export function SideNav({ activeTab, onTabChange, tabs, onOpenUsers }: SideNavProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Side Navigation */}
      <aside className="desktop-sidenav" style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '260px',
        background: '#2e2416',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        borderRight: '1px solid #3a2e20',
      }}>
        {/* Logo Section */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #3a2e20',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '36px' }}>🐄</span>
            <div>
              <div style={{ color: '#f5f0e8', fontWeight: 700, fontSize: '18px', lineHeight: 1.2 }}>Ternak</div>
              <div style={{ color: '#7a6a52', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>Farm Manager</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`sidenav-item ${activeTab === tab.key ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: activeTab === tab.key ? '#f5f0e8' : 'transparent',
                color: activeTab === tab.key ? '#2e2416' : '#9a8a72',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              {tab.count > 0 && (
                <span style={{
                  fontSize: '13px',
                  opacity: 0.6,
                  background: activeTab === tab.key ? 'rgba(46, 36, 22, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                }}>{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid #3a2e20',
          }}>
            {/* Admin: User Management Button */}
            {user.role === 'admin' && (
              <button
                onClick={onOpenUsers}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  marginBottom: '12px',
                  background: '#3a2e20',
                  color: '#f5f0e8',
                  border: '1px solid #9a8a72',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span>👥</span>
                <span>User Management</span>
              </button>
            )}

            {/* User Info & Logout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'rgba(58, 46, 32, 0.5)',
              borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#9a8a72',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#f5f0e8',
                  fontWeight: 600,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#f5f0e8', fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                  <div style={{ color: '#7a6a52', fontSize: '11px', textTransform: 'uppercase' }}>{user.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid #9a8a72',
                  color: '#9a8a72',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header Bar */}
      <header className="mobile-header" style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#2e2416',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 100,
        borderBottom: '1px solid #3a2e20',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '28px' }}>🐄</span>
          <span style={{ color: '#f5f0e8', fontWeight: 600, fontSize: '16px' }}>Ternak</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle menu"
        >
          <span style={{ fontSize: '24px', color: '#f5f0e8' }}>
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99,
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="mobile-menu-dropdown"
            style={{
              position: 'fixed',
              top: '64px',
              right: 0,
              width: '280px',
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
              background: '#2e2416',
              padding: '16px',
              zIndex: 100,
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
              animation: 'slideInRight 0.2s ease',
            }}
          >
            {/* Mobile Nav Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    background: activeTab === tab.key ? '#f5f0e8' : 'transparent',
                    color: activeTab === tab.key ? '#2e2416' : '#9a8a72',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span style={{
                      fontSize: '13px',
                      opacity: 0.6,
                      padding: '4px 10px',
                      borderRadius: '100px',
                      background: activeTab === tab.key ? 'rgba(46, 36, 22, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    }}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile User Section */}
            {user?.role === 'admin' && (
              <>
                <div style={{ height: '1px', background: '#3a2e20', margin: '12px 0' }} />
                <button
                  onClick={() => {
                    onOpenUsers?.();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '14px 18px',
                    background: '#3a2e20',
                    color: '#f5f0e8',
                    border: '1px solid #9a8a72',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    marginBottom: '12px',
                  }}
                >
                  <span>👥</span>
                  <span>User Management</span>
                </button>
              </>
            )}

            <div style={{ height: '1px', background: '#3a2e20', margin: '12px 0' }} />

            {/* Mobile User Info */}
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'rgba(58, 46, 32, 0.5)',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#9a8a72',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#f5f0e8',
                    fontWeight: 600,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#f5f0e8', fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                    <div style={{ color: '#7a6a52', fontSize: '11px', textTransform: 'uppercase' }}>{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: '1px solid #9a8a72',
                    color: '#f5f0e8',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
