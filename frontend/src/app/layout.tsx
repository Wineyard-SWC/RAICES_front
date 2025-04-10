import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/providers";
import { EpicProvider } from "@/contexts/epiccontext";
import { RequirementProvider } from "@/contexts/requirementcontext";
import { UserStoryProvider } from "@/contexts/userstorycontext";
import { ProjectProvider } from "@/contexts/projectcontext";
import { SelectedRequirementProvider } from "@/contexts/selectedrequirements";
import { SessionProvider } from "@/contexts/sessioncontext";
import { SelectedEpicProvider } from "@/contexts/selectedepics";
import { SelectedUserStoriesProvider } from "@/contexts/selecteduserstories";
import "../styles/globals.css";

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
                          {/* Contenedor para inyectar los modales mediante Portals */}
                          <div id="modal-root" />
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
