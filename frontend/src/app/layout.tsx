import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/providers";
import { EpicProvider } from "@/contexts/epiccontext";
import { RequirementProvider } from "@/contexts/requirementcontext";
import { UserStoryProvider } from "@/contexts/userstorycontext";
import { ProjectProvider } from "@/contexts/projectcontext";
import { SelectedRequirementProvider } from "@/contexts/selectedrequirements";
import { SessionProvider } from "@/contexts/sessioncontext";
import "../styles/globals.css";
import { Inter } from 'next/font/google';
import { SelectedEpicProvider } from "@/contexts/selectedepics";
import { SelectedUserStoriesProvider } from "@/contexts/selecteduserstories";

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
      <RequirementProvider>
        <EpicProvider>
          <UserStoryProvider>
            <ProjectProvider>
              <SessionProvider>
                <SelectedRequirementProvider>
                  <SelectedEpicProvider>
                    <SelectedUserStoriesProvider>
                      <AppProviders>
                        {children}
                      </AppProviders>
                    </SelectedUserStoriesProvider>
                  </SelectedEpicProvider>
                </SelectedRequirementProvider>
              </SessionProvider>
            </ProjectProvider>
          </UserStoryProvider>
        </EpicProvider>
      </RequirementProvider>
      </body>
    </html>
  );
}
