import type { Metadata } from 'next';
import './globals.css';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import Providers from '@/app/provider';
import { Toaster } from 'sonner';
import { IntroProvider } from '@/context/IntroContext';
import CallUsButton from '@/components/common/CallUsButton';
import TeamButton from '@/components/common/TeamButton';
import BusTrackerButton from '@/components/common/BusTrackerButton';

export const metadata: Metadata = {
  title: 'UBTS',
  description: 'UBTS - University Bus Transport System',
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
          <Toaster richColors position="top-center" />

          <main className="flex-1 overflow-y-auto">{children}</main>

          <IntroProvider>
            <CallUsButton />
            <TeamButton />
            <BusTrackerButton />
          </IntroProvider>
          <ScrollToTopButton />
        </Providers>
      </body>
    </html>
  );
}
