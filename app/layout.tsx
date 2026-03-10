import type { Metadata } from 'next';
import { CSPostHogProvider } from './providers';
import { Inter } from 'next/font/google';
import './globals.css';

// Promise.withResolvers polyfill is loaded via providers.tsx (imported at module level).

const inter = Inter({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Bourbn',
  description:
    'Digital bridge between a traditional sales process and modern document management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <body className={`${inter.variable} antialiased`}>{children}</body>
      </CSPostHogProvider>
    </html>
  );
}
