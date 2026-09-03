import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';

import AppProvider from '@/lib/AppProvider';
import theme from '@/theme';
import '../styles/globals.css';
import '../styles/animation.css';
import { StoreInitializer } from '@/components/StoreInitializer';

export const metadata: Metadata = {
  title: 'Shoe shop',
  description: 'Solvd final project - shoe shop',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/icons/logo.svg" sizes="any" />
      <body>
        <AppProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <StoreInitializer>{children}</StoreInitializer>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </AppProvider>
      </body>
    </html>
  );
}
