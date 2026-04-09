'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { Asset, FeedInventory } from '@/types';

interface InventoryDashboardProps {
  onNavigate?: (page: string) => void;
  onAddAsset?: () => void;
  onAddFeed?: () => void;
}

export function InventoryDashboard({ onNavigate, onAddAsset, onAddFeed }: InventoryDashboardProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [feeds, setFeeds] = useState<FeedInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [assetStats, setAssetStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [assetsRes, feedsRes, statsRes] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/feed-inventory'),
        fetch('/api/assets/stats'),
      ]);

      if (!assetsRes.ok || !feedsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [assetsData, feedsData, statsData] = await Promise.all([
        assetsRes.json(),
        feedsRes.json(),
        statsRes.json(),
      ]);

      setAssets(assetsData);
      setFeeds(feedsData);
      setAssetStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalAssets = assets.length;
  const totalFeedItems = feeds.length;
  
  const lowStockAlerts = feeds.filter(
    (feed) => feed.currentStock != null && feed.minStock != null && feed.currentStock <= feed.minStock
  ).length;

  const expiringSoon = feeds.filter((feed) => {
    if (!feed.expiryDate) return false;
    const expiryDate = new Date(feed.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  const totalAssetQuantity = assets.reduce((sum, asset) => sum + (asset.quantity || 0), 0);
  const totalFeedStock = feeds.reduce((sum, feed) => sum + (feed.currentStock || 0), 0);

  // Assets by category
  const assetsByCategory: Record<string, number> = {};
  assets.forEach((asset) => {
    const category = asset.category || 'Uncategorized';
    assetsByCategory[category] = (assetsByCategory[category] || 0) + 1;
  });

  // Assets by status
  const assetsByStatus: Record<string, number> = {};
  assets.forEach((asset) => {
    const status = asset.status || 'Active';
    assetsByStatus[status] = (assetsByStatus[status] || 0) + 1;
  });

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8a7d6b', fontFamily: 'monospace' }}>
        Memuat data inventaris...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Cards */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Dashboard Inventaris</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {/* Total Assets */}
          <div style={{
            padding: 20,
            background: '#faf6ee',
            borderRadius: 14,
            border: '1px solid #e0d4c0',
          }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', marginBottom: 8 }}>Total Aset</div>
            <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700, color: '#3a2e20' }}>{totalAssets}</div>
            <div style={{ fontSize: 'var(--fs-xs)', color: '#666', marginTop: 4 }}>
              {totalAssetQuantity} unit
            </div>
          </div>

          {/* Total Feed Items */}
          <div style={{
            padding: 20,
            background: '#faf6ee',
            borderRadius: 14,
            border: '1px solid #e0d4c0',
          }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', marginBottom: 8 }}>Total Pakan</div>
            <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700, color: '#3a2e20' }}>{totalFeedItems}</div>
            <div style={{ fontSize: 'var(--fs-xs)', color: '#666', marginTop: 4 }}>
              {totalFeedStock} stok
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockAlerts > 0 && (
            <div style={{
              padding: 20,
              background: '#fef2f2',
              borderRadius: 14,
              border: '2px solid #ef4444',
            }}>
              <div style={{ fontSize: 'var(--fs-sm)', color: '#ef4444', marginBottom: 8 }}>⚠️ Stok Menipis</div>
              <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700, color: '#dc2626' }}>{lowStockAlerts}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: '#666', marginTop: 4 }}>
                Perlu restock
              </div>
            </div>
          )}

          {/* Expiring Soon */}
          {expiringSoon > 0 && (
            <div style={{
              padding: 20,
              background: '#fffbeb',
              borderRadius: 14,
              border: '2px solid #f59e0b',
            }}>
              <div style={{ fontSize: 'var(--fs-sm)', color: '#f59e0b', marginBottom: 8 }}>⏰ Segera Kadaluarsa</div>
              <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700, color: '#d97706' }}>{expiringSoon}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: '#666', marginTop: 4 }}>
                Dalam 30 hari
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: 20,
        background: '#faf6ee',
        borderRadius: 14,
        border: '1px solid #e0d4c0',
      }}>
        <h3 style={{ marginBottom: 16 }}>Aksi Cepat</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button onClick={onAddAsset}>+ Tambah Aset</Button>
          <Button onClick={onAddFeed}>+ Tambah Pakan</Button>
        </div>
      </div>

      {/* Assets by Category */}
      <div style={{
        padding: 20,
        background: '#faf6ee',
        borderRadius: 14,
        border: '1px solid #e0d4c0',
      }}>
        <h3 style={{ marginBottom: 16 }}>Aset per Kategori</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(assetsByCategory).map(([category, count]) => (
            <div key={category} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #e0d4c0',
            }}>
              <span style={{ fontWeight: 500, color: '#3a2e20' }}>{category}</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: '#3b82f620',
                color: '#3b82f6',
                fontSize: 'var(--fs-sm)',
                fontWeight: 600,
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Assets by Status */}
      <div style={{
        padding: 20,
        background: '#faf6ee',
        borderRadius: 14,
        border: '1px solid #e0d4c0',
      }}>
        <h3 style={{ marginBottom: 16 }}>Aset per Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(assetsByStatus).map(([status, count]) => {
            const statusColors: Record<string, string> = {
              Active: '#22c55e',
              Maintenance: '#f59e0b',
              Retired: '#6b7280',
              Lost: '#ef4444',
            };
            const color = statusColors[status] || '#6b7280';

            return (
              <div key={status} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #e0d4c0',
              }}>
                <span style={{ fontWeight: 500, color: '#3a2e20' }}>{status}</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: `${color}20`,
                  color,
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 600,
                }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Stock Alerts Detail */}
      {lowStockAlerts > 0 && (
        <div style={{
          padding: 20,
          background: '#fef2f2',
          borderRadius: 14,
          border: '2px solid #ef4444',
        }}>
          <h3 style={{ marginBottom: 16, color: '#dc2626' }}>⚠️ Peringatan Stok Menipis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feeds
              .filter((feed) => feed.currentStock != null && feed.minStock != null && feed.currentStock <= feed.minStock)
              .map((feed) => (
                <div key={feed.id} style={{
                  padding: '12px 16px',
                  background: '#fff',
                  borderRadius: 8,
                  border: '1px solid #fecaca',
                }}>
                  <div style={{ fontWeight: 600, color: '#3a2e20', marginBottom: 4 }}>{feed.name}</div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: '#666' }}>
                    Stok saat ini: <strong style={{ color: '#dc2626' }}>{feed.currentStock}</strong>
                    {feed.minStock && ` (Minimum: ${feed.minStock})`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expiring Soon Detail */}
      {expiringSoon > 0 && (
        <div style={{
          padding: 20,
          background: '#fffbeb',
          borderRadius: 14,
          border: '2px solid #f59e0b',
        }}>
          <h3 style={{ marginBottom: 16, color: '#d97706' }}>⏰ Pakan Segera Kadaluarsa</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feeds
              .filter((feed) => {
                if (!feed.expiryDate) return false;
                const expiryDate = new Date(feed.expiryDate);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
              })
              .map((feed) => {
                const expiryDate = new Date(feed.expiryDate!);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={feed.id} style={{
                    padding: '12px 16px',
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #fde68a',
                  }}>
                    <div style={{ fontWeight: 600, color: '#3a2e20', marginBottom: 4 }}>{feed.name}</div>
                    <div style={{ fontSize: 'var(--fs-sm)', color: '#666' }}>
                      Kadaluarsa: <strong style={{ color: '#d97706' }}>{feed.expiryDate}</strong>
                      {' '}(dalam {daysUntilExpiry} hari)
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
