import type { Metadata } from 'next';
import './globals.css';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import Providers from '@/app/provider';
import { Toaster } from 'sonner';
import { IntroProvider } from '@/context/IntroContext';

import TransportFab from '@/components/common/TransportFab';

export const metadata: Metadata = {
  title: 'BU Trace',
  description: 'BU Trace - University Bus Transport System',
  icons: {
    icon: '/static/BUTracelogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <Providers>
          <Toaster richColors position="top-right" />

          <main className="flex-1 overflow-y-auto">{children}</main>

          <IntroProvider>
            <TransportFab />
          </IntroProvider>
          <ScrollToTopButton />
        </Providers>
        <div id="modal-root" />
      </body>
    </html>
  );
}
