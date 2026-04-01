'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/in');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0ead8'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐄</div>
        <div style={{ color: '#8a7d6b', fontFamily: 'monospace' }}>Redirecting...</div>
      </div>
    </div>
  );
}
