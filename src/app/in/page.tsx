'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/in/herd');
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
        <div style={{ color: '#8a7d6b', fontFamily: 'monospace' }}>Loading...</div>
      </div>
    </div>
  );
}
