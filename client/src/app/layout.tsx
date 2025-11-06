import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import Providers from "@/app/provider";
import { Toaster } from "sonner";
import { IntroProvider } from "@/context/IntroContext";
import CallUsButton from '@/components/common/CallUsButton';
import TeamButton from '@/components/common/TeamButton';

import Footer from "@/components/common/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UBTS",
  description: "UBTS - University Bus Tracking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          {/* Global toast notifications */}
          <Toaster richColors position="top-center" />

          {/* Page-specific content */}
          <main className="flex-1 overflow-y-auto">{children}</main>

          {/* Global Footer */}
          <Footer />
          <IntroProvider>
          <CallUsButton />
          <TeamButton/>
          </IntroProvider>
          <ScrollToTopButton />
        </Providers>
      </body>
    </html>
  );
}