import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { AllProviders } from "@/providers/providers";

import "../styles/globals.css";
import { AppProvider } from "@/contexts/appContext/AppContext";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAICES",
  description: 'Your Project Management App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <AppProvider>
          <AllProviders>
            {children}
            <div id="modal-root" />
          </AllProviders>
        </AppProvider>
      </body>
    </html>
  );
}
