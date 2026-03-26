import type { Metadata } from 'next';
import { FarmProvider } from '@/context/FarmContext';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Ranch OS - Cattle Farm Manager',
  description: 'Manage your cattle farm with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FarmProvider>
            {children}
          </FarmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
