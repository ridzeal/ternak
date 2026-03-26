'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from './Modal';
import { Toast } from './Toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'worker';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManagement({ isOpen, onClose }: UserManagementProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker' as 'admin' | 'manager' | 'worker',
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast(data.error || 'Failed to create user');
        return;
      }

      setToast('✅ User created successfully');
      setFormData({ name: '', email: '', password: '', role: 'worker' });
      setShowCreateModal(false);
      fetchUsers();
    } catch (error) {
      setToast('❌ Network error');
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setToast(currentStatus ? '✅ User deactivated' : '✅ User activated');
        fetchUsers();
      }
    } catch (error) {
      setToast('❌ Failed to update user');
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    const newPassword = prompt('Enter new password for ' + userEmail);
    if (!newPassword) return;

    try {
      const res = await fetch(`/api/auth/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast(data.error || 'Failed to reset password');
        return;
      }

      setToast('✅ Password reset successfully');
    } catch (error) {
      setToast('❌ Failed to reset password');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="👥 User Management"
        subtitle="Manage farm staff access"
      >
        <div style={{ padding: '20px 0' }}>
          {/* Header with Add Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <div>
              <span style={{ fontSize: 12, color: '#8a7d6b' }}>
                {users.length} user{users.length !== 1 ? 's' : ''} total
              </span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '8px 16px',
                background: '#2e2416',
                color: '#f5f0e8',
                border: 'none',
                borderRadius: 100,
                fontSize: 12,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              + Add User
            </button>
          </div>

          {/* Users List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8a7d6b' }}>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8a7d6b' }}>
              No users found. Create the first user to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: '14px 16px',
                    background: '#faf6ee',
                    borderRadius: 10,
                    border: '1px solid #e0d4c0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: user.role === 'admin' ? '#fce4ec' : '#f0e4d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    border: '1.5px solid #e0d0b8',
                    flexShrink: 0,
                  }}>
                    {user.role === 'admin' ? '👑' : '👤'}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: 14, color: '#2e2416' }}>
                        {user.name}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 100,
                        fontSize: 9,
                        fontFamily: 'monospace',
                        background: user.role === 'admin' ? '#fce4ec' : 
                                   user.role === 'manager' ? '#e3f2fd' : '#f0e4d0',
                        color: user.role === 'admin' ? '#880e4f' : 
                               user.role === 'manager' ? '#1565c0' : '#6a5a48',
                        border: `1px solid ${user.role === 'admin' ? '#f48fb1' : 
                                            user.role === 'manager' ? '#90caf9' : '#e0d0b8'}`,
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                      {!user.isActive && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 100,
                          fontSize: 9,
                          fontFamily: 'monospace',
                          background: '#fdecea',
                          color: '#c0392b',
                          border: '1px solid #f1a1a1',
                        }}>
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a7d6b', marginTop: 2 }}>
                      {user.email}
                    </div>
                    {user.lastLoginAt && (
                      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#b0a090', marginTop: 2 }}>
                        Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {user.id !== currentUser?.id && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        style={{
                          padding: '6px 10px',
                          background: user.isActive ? '#f0e4d0' : '#e8f5e9',
                          color: user.isActive ? '#6a5a48' : '#2e7d32',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 10,
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                        }}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.email)}
                        style={{
                          padding: '6px 10px',
                          background: '#f0e4d0',
                          color: '#6a5a48',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 10,
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                        }}
                        title="Reset Password"
                      >
                        🔑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', email: '', password: '', role: 'worker' });
        }}
        title="👤 Add New User"
        subtitle="Create staff account"
      >
        <form onSubmit={handleCreateUser} style={{ padding: '20px 0' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#8a7d6b',
                marginBottom: 6,
              }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #d6cbba',
                  background: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#8a7d6b',
                marginBottom: 6,
              }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #d6cbba',
                  background: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
                placeholder="e.g. john@farm.com"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#8a7d6b',
                marginBottom: 6,
              }}>
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #d6cbba',
                  background: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#8a7d6b',
                marginBottom: 6,
              }}>
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #d6cbba',
                  background: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="worker">Worker - Basic access</option>
                <option value="manager">Manager - Can view reports</option>
                <option value="admin">Admin - Full access</option>
              </select>
            </div>
          </div>

          <div style={{
            marginTop: 24,
            padding: '12px 16px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: 8,
            fontSize: 11,
            color: '#856404',
          }}>
            ⚠️ <strong>Important:</strong> Share the password with the user securely. 
            It cannot be retrieved later.
          </div>

          <div style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            marginTop: 20,
          }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1.5px solid #d6cbba',
                color: '#8a7d6b',
                borderRadius: 100,
                fontFamily: 'monospace',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#2e2416',
                color: '#f5f0e8',
                border: 'none',
                borderRadius: 100,
                fontFamily: 'monospace',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}
